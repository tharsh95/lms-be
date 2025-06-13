import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/course.model';
import { BadRequestError } from '../middleware/error.middleware';
import { uploadResult } from '../utils/upload';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { generateResponse } from '../utils/deepseek';
import { extractionPrompt, gradingReferencesPrompt } from '../utils/prompt';
import Class from '../models/class.model';
import AssignmentModel from '../models/assignment.model';
// Create course with PDF syllabus
export const createSyllabusWithPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { courseName, subject, grade, description } = JSON.parse(req.body.details);
    const { file } = req;

    if (!file) {
      throw new BadRequestError('Syllabus PDF is required');
    }

    // Validate file type
    if (!file.mimetype || !file.mimetype.includes('pdf')) {
      throw new BadRequestError('Only PDF files are allowed');
    }

    // Upload PDF to Cloudinary
    const uploadRes = await uploadResult(file);

    // Read and parse PDF with error handling
    const dataBuffer = fs.readFileSync(file.path);
    let pdfText = '';
    
    try {
      const pdfData = await pdfParse(dataBuffer);
      if (!pdfData || !pdfData.text) {
        throw new Error('Could not extract text from PDF');
      }
      pdfText = pdfData.text;
    } catch (error: any) {
      console.error('PDF parsing error:', error);
      // If pdf-parse fails, try to use the file directly
      if (error.message.includes('bad XRef entry')) {
        throw new BadRequestError('The PDF file appears to be corrupted or has an invalid structure. Please try converting the PDF to a different format or recreating it.');
      }
      throw new BadRequestError('Failed to process the PDF file. Please ensure it is not corrupted and try again.');
    }

    if (!pdfText) {
      throw new BadRequestError('Could not extract any text from the PDF. The file might be empty or corrupted.');
    }

    const data = await generateResponse(JSON.stringify(extractionPrompt + pdfText + JSON.stringify({ courseName, subject, grade, description }) + "Make sure the required fields should be in camel case format and the output should be valid json strictly"));
    
    if (!data) {
      throw new BadRequestError('No response from AI');
    }

    // Remove triple backticks and language hints
    let jsonString = data.trim();
    const lines = jsonString.split('\n');

    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    jsonString = lines.join('\n');

    // Final sanitation of invisible control characters
    const cleanedString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    let parsedSyllabus;
    
    try {
      if (!cleanedString.startsWith('{') || !cleanedString.endsWith('}')) {
        throw new Error('Response does not appear to be a valid JSON object');
      }
      parsedSyllabus = JSON.parse(cleanedString);
    } catch (error: any) {
      console.error('Error parsing AI response:', error.message);
      console.error('First 200 chars of response:', data.slice(0, 200));
      console.error('Cleaned string:', cleanedString);
      throw new BadRequestError(`Invalid response format from AI: ${error.message}`);
    }

    parsedSyllabus.gradingReferences = [];
    const course = await Course.create({
      courseName,
      subject,
      grade,
      description,
      syllabusPdfUrl: uploadRes.secure_url,
      parsedSyllabus: parsedSyllabus,
      createdBy: req.user?.email,
      aiMetadata: {
        prompt: extractionPrompt,
        referenceBooks: [],
        generatedSyllabus: '', // This will be filled by AI later
      },
    });

    const classes = await Class.find({
      subject: course.subject,
      grade: course.grade
    });

    for (const cls of classes) {
      cls.courses.push(course._id);
      await cls.save();
    }

    // Clean up: Delete the temporary file
    fs.unlinkSync(file.path);

    res.status(201).json({
      success: true,
      data: course,
    });
    return res;
  } catch (error) {
    next(error);
    return res;
  }
};

// Create course with AI-generated syllabus
export const createSyllabusWithAI = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {

    //  // console.log(req.body,74)
    const data = await generateResponse(JSON.stringify(req.body) + "Make sure the required fields should be in camel case format and the output should be valid json strictly" + extractionPrompt) // Create course with AI metadata
    if (!data) {
      throw new BadRequestError('No response from AI');
    }

    // 4. Remove triple backticks and language hints (```json, ```javascript, etc.)
    let jsonString = data.trim();
    const lines = jsonString.split('\n');

    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    jsonString = lines.join('\n');



    // 5. Final sanitation of invisible control characters
    const cleanedString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    let parsedSyllabus;
    try {
      if (!cleanedString.startsWith('{') || !cleanedString.endsWith('}')) {
        throw new Error('Response does not appear to be a valid JSON object');
      }
      parsedSyllabus = JSON.parse(cleanedString);
    } catch (error: any) {
      console.error('Error parsing AI response:', error.message);
      console.error('First 200 chars of response:', data.slice(0, 200));
      console.error('Cleaned string:', cleanedString);
      throw new BadRequestError(`Invalid response format from AI: ${error.message}`);
    }
    parsedSyllabus.gradingReferences = []
    const course = await Course.create({
      courseName: req.body.courseDetails.courseName,
      subject: req.body.courseDetails.subject,
      grade: req.body.courseDetails.grade,
      description: req.body.courseDetails.description,
      parsedSyllabus: parsedSyllabus,
      createdBy: req.user?.email,
      aiMetadata: {
        prompt: req.body.prompt + extractionPrompt,
        referenceBooks: req.body.additionalInfo,
        generatedSyllabus: '', // This will be filled by AI later
      },
    });
    const classes = await Class.find({
      subject: course.subject,
      grade: course.grade
    })
    for (const cls of classes) {
      cls.courses.push(course._id)
      await cls.save()
    }
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
  // const course = await Course.findById("6813369ff218984487007b4f");
  // res.status(201).json({
  //   success: true,
  //   data:course,
  // });
  return res;
};

// Get all courses
export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const courses = await Course.find()
      .select('-aiMetadata -parsedSyllabus')  // Exclude multiple fields
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Get enrollment information for each course
    const coursesWithEnrollment = await Promise.all(
      courses.map(async (course) => {
        // Find classes that have this course
        const classes = await Class.find({
          subject: course.subject,
          grade: course.grade,
        }).populate({
          path: 'students',
          select: '_id' // Select only needed user fields
        });

        // Calculate total enrolled students
        const enrolledStudents = classes.reduce((total, cls) => total + cls.students.length, 0);
        const assignments = await AssignmentModel.find({
          course: course._id,
          isActive: true
        })

        return {
          ...course.toObject(),
          enrollment: {
            totalStudents: enrolledStudents,
            totalAssignments: assignments.length,
            classes: classes.map(cls => ({
              classId: cls._id,
              className: cls.name,
              students: cls.students
            }))
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: coursesWithEnrollment,
    });
    return res;
  } catch (error) {
    next(error);
    return res;
  }
};

// Get course by ID
export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find classes that have this course
    const classes = await Class.find({
      subject: course.subject,
      grade: course.grade
    }).populate({
      path: 'students',
      select: 'name email'
    });

    // Get assignments for this course
    const assignments = await AssignmentModel.find({
      course: course._id,
      isActive: true
    }).sort({ createdAt: -1 });

    // Calculate total enrolled students
    const enrolledStudents = classes.reduce((total, cls) => total + cls.students.length, 0);

    const courseWithEnrollment = {
      ...course.toObject(),
      enrollment: {
        totalStudents: enrolledStudents,
        classes: classes.map(cls => ({
          classId: cls._id,
          className: cls.name,
          students: cls.students
        }))
      },
      assignments: assignments
    };

    res.status(200).json({
      success: true,
      data: courseWithEnrollment,
    });
    return res;
  } catch (error) {
    next(error);
    return res;
  }
};
export const updateCourseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

// Create course with AI-generated syllabus
// export const createCourse = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response> => {
//   try {
//     const { id } = req.body;

//     // Prepare prompt for response generation
//     const prompt = JSON.stringify(req.body) +
//       " Make sure the required fields should be in camelCase format and the output should be valid JSON strictly. " +
//       gradingReferencesPrompt;

//     const data = await generateResponse(prompt);
//     if (!data) {
//       throw new BadRequestError('No response from AI');
//     }

//     // 4. Remove triple backticks and language hints (```json, ```javascript, etc.)
//     let jsonString = data.trim();
//     const lines = jsonString.split('\n');

//     if (lines[0].startsWith('```')) lines.shift();
//     if (lines[lines.length - 1].startsWith('```')) lines.pop();
//     jsonString = lines.join('\n');



//     // 5. Final sanitation of invisible control characters

//     const cleanedString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
//     let gradingReferences={};
//     try {
//       if (!cleanedString.startsWith('{') || !cleanedString.endsWith('}')) {
//         throw new Error('Response does not appear to be a valid JSON object');
//       }
//       gradingReferences = JSON.parse(cleanedString);
//     } catch (error: any) {
//       console.error('Error parsing AI response:', error.message);
//       console.error('First 200 chars of response:', data.slice(0, 200));
//       console.error('Cleaned string:', cleanedString);
//       throw new BadRequestError(`Invalid response format from AI: ${error.message}`);
//     }

//     // Find course and update
//     const course = await Course.findById(id);
//     if (!course) {
//        return res.status(404).json({ error: "Course not found" });
//     }

//     course.parsedSyllabus = {
//       ...course.parsedSyllabus,
//        ...gradingReferences,
//     };

//     await course.save();

//      res.status(200).json({ message: "Grading reference added successfully", course });


//   } catch (error) {
//     next(error);
//   }
//   return res;
// }
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { id } = req.body;

    // Prepare prompt for response generation
    const prompt =
      JSON.stringify(req.body) +
      " Make sure the required fields should be in camelCase format and the output should be valid JSON strictly. " +
      gradingReferencesPrompt;

    const data = await generateResponse(prompt);
    if (!data) {
      throw new BadRequestError("No response from AI");
    }

    // Remove triple backticks and language hints (```json, ```javascript, etc.)
    let jsonString = data.trim();
    const lines = jsonString.split("\n");

    if (lines[0].startsWith("```")) lines.shift();
    if (lines[lines.length - 1].startsWith("```")) lines.pop();
    jsonString = lines.join("\n");

    // Sanitize: Remove control characters and anything after final closing brace
    const cleanedString = jsonString
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // control characters
      .replace(/}\s*[^}]*$/, "}"); // extra characters after last }

    let gradingReferences = {};
    try {
      if (!cleanedString.startsWith("{") || !cleanedString.endsWith("}")) {
        throw new Error("Response does not appear to be a valid JSON object");
      }
      gradingReferences = JSON.parse(cleanedString);
    } catch (error: any) {
      console.error("Error parsing AI response:", error.message);
      console.error("First 200 chars of original data:", data.slice(0, 200));
      console.error("Cleaned string preview:", cleanedString.slice(0, 200));
      throw new BadRequestError(`Invalid response format from AI: ${error.message}`);
    }

    // Find course and update
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    course.parsedSyllabus = {
      ...course.parsedSyllabus,
      ...gradingReferences,
    };

    await course.save();

    return res.status(200).json({ message: "Grading reference added successfully", course });

  } catch (error) {
    next(error);
    return res;
  }
};
export const getCourseMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const courses = await Course.find()
      .select('subject grade courseName')
      .sort({ courseName: 1 });

    res.status(200).json({
      success: true,
      data: courses
    });
    return res;
  } catch (error) {
    next(error);
    return res;
  }
};

export const getAssignmentsByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { courseId } = req.params;
    const assignment = await AssignmentModel.find({ course: courseId })
      // .populate({
      //   path: 'assignments',
      //   select: 'title description type grade createdAt'
      // })
      .select('title description status type grade createdAt');

    if (!assignment) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
    return res;
  } catch (error) {
    next(error);
    return res;
  }
};
