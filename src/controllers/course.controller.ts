import { Request, Response, NextFunction } from 'express';
import { Course } from '../models/course.model';
import { BadRequestError } from '../middleware/error.middleware';
import { uploadResult } from '../utils/upload';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { generateResponse } from '../utils/deepseek';
import { extractionPrompt, gradingReferencesPrompt } from '../utils/prompt';
import { cleanAndValidateJSON } from '../utils/validatejson';
import Class from '../models/class.model';
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

    // Read and parse PDF
    // const dataBuffer = fs.readFileSync(file.path);
    // const pdfData = await pdfParse(dataBuffer);
    // const pdfText = pdfData.text;
    // const data = await generateResponse(req.body.details+extractionPrompt + pdfText);
    // const data = await generateResponse(extractionPrompt + pdfText+JSON.stringify({courseName,subject,grade,description}));
    // const data = "```javascript\n{\n  \"courseTitle\": \"Class 10 Physics Syllabus: Alternating Current\",\n  \"instructor\": {\n    \"name\": \"Not specified\",\n    \"title\": \"Not specified\"\n  },\n  \"term\": \"Academic Year 2025-2026\",\n  \"courseDescription\": \"This module introduces students to the principles and applications of alternating current (AC) electricity. Students will learn about the generation, properties, and applications of AC in everyday life and technology.\",\n  \"learningObjectives\": [\n    \"Understand the fundamental principles of alternating current\",\n    \"Differentiate between direct current (DC) and alternating current (AC)\",\n    \"Explain the generation of alternating current\",\n    \"Understand and calculate key AC parameters (frequency, amplitude, RMS value)\",\n    \"Describe AC circuits with resistors, capacitors, and inductors\",\n    \"Explain the working of transformers and their applications\",\n    \"Solve problems related to AC electricity\"\n  ],\n  \"requiredMaterials\": [\n    {\n      \"title\": \"Concise Physics for ICSE Class 10\",\n      \"author\": \"Not specified\",\n      \"publisher\": \"Selina Publishers\",\n      \"year\": \"Not specified\",\n      \"required\": true\n    },\n    {\n      \"title\": \"Physics for Class 10\",\n      \"author\": \"Not specified\",\n      \"publisher\": \"S. Chand Publications\",\n      \"year\": \"Not specified\",\n      \"required\": true\n    },\n    {\n      \"title\": \"Frank ICSE Physics for Class 10\",\n      \"author\": \"Not specified\",\n      \"publisher\": \"Not specified\",\n      \"year\": \"Not specified\",\n      \"required\": true\n    },\n    {\n      \"title\": \"ICSE Physics for Class 10\",\n      \"author\": \"Not specified\",\n      \"publisher\": \"Bharti Bhawan Publishers\",\n      \"year\": \"Not specified\",\n      \"required\": false\n    },\n    {\n      \"title\": \"New Simplified Physics for Class 10\",\n      \"author\": \"S.P. Agarwal\",\n      \"publisher\": \"Not specified\",\n      \"year\": \"Not specified\",\n      \"required\": false\n    }\n  ],\n  \"gradingPolicy\": {\n    \"participation\": {\n      \"percentage\": 5,\n      \"description\": \"Class participation\"\n    },\n    \"laboratoryWork\": {\n      \"percentage\": 15,\n      \"description\": \"Laboratory work\"\n    },\n    \"classTests\": {\n      \"percentage\": 20,\n      \"description\": \"Class tests (2)\"\n    },\n    \"writtenExamination\": {\n      \"percentage\": 60,\n      \"description\": \"Written examination covering: Multiple-choice questions, Short answer questions, Numerical problems, Long answer questions\"\n    }\n  },\n  \"weeklySchedule\": [\n    {\n      \"week\": 1,\n      \"topic\": \"Introduction to Alternating Current\",\n      \"readings\": \"Not specified\",\n      \"assignments\": \"Not specified\"\n    },\n    {\n      \"week\": 2,\n      \"topic\": \"Generation of Alternating Current\",\n      \"readings\": \"Not specified\",\n      \"assignments\": \"Not specified\"\n    },\n    {\n      \"week\": 3,\n      \"topic\": \"AC Parameters\",\n      \"readings\": \"Not specified\",\n      \"assignments\": \"Not specified\"\n    },\n    {\n      \"week\": 4,\n      \"topic\": \"AC Circuit Elements\",\n      \"readings\": \"Not specified\",\n      \"assignments\": \"Not specified\"\n    },\n    {\n      \"week\": 5,\n      \"topic\": \"Transformers\",\n      \"readings\": \"Not specified\",\n      \"assignments\": \"Not specified\"\n    },\n    {\n      \"week\": 6,\n      \"topic\": \"Household Electricity\",\n      \"readings\": \"Not specified\",\n      \"assignments\": \"Not specified\"\n    }\n  ],\n  \"policies\": {\n    \"attendance\": \"Not specified\",\n    \"lateWork\": \"Not specified\",\n    \"academicIntegrity\": \"Not specified\",\n    \"accommodations\": \"Not specified\"\n  }\n}\n```"
    // const jsonString = data.replace(/^```javascript\s*/, '').replace(/\s*```$/, '');

    // console.log(JSON.parse(jsonString), 'data');
    // Upload PDF to Cloudinary
    // const uploadRes = await uploadResult(file);

    // Create course
    // const course = await Course.create({
    //   courseName,
    //   subject,
    //   grade,
    //   description,
    //   createdBy: req.user?.email,
    //   syllabusPdfUrl: uploadRes.secure_url,
    //   parsedSyllabus: JSON.parse(jsonString),
    //   aiMetadata: {
    //     prompt: `Generate a course structure based on this syllabus: ${pdfText}`,
    //     referenceBooks: [],
    //     generatedSyllabus: {}
    //   }
    // });

    // Clean up: Delete the temporary file
    // fs.unlinkSync(file.path);
    // const course = await Course.findById("6811edacea9640f4b71201cd");
    const course = await Course.findById("68121f9268e7df1c7997633f");
    res.status(201).json({
      success: true,
      // data:JSON.parse(jsonString),
      data:course,
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
//   try {

//  // console.log(req.body,74)
//  const data = await generateResponse(JSON.stringify(req.body)+"Make sure the required fields should be in camel case format and the output should be valid json strictly"+extractionPrompt) // Create course with AI metadata
//  console.log(data,"data")
//  // const jsonString = cleanAndValidateJSON(data)
//  const jsonString = data.replace(/^```(?:json|javascript)?\s*|\s*```$/g, '');

// //  const jsonString = data.replace(/^```json\s*/, '').replace(/\s*```$/, '');
//      const course = await Course.create({
//        courseName:req.body.courseDetails.courseName,
//        subject:req.body.courseDetails.subject,
//        grade:req.body.courseDetails.grade,
//        description:req.body.courseDetails.description,
//        parsedSyllabus:JSON.parse(jsonString),
//        // createdBy: req.user?.email,
//        aiMetadata: {
//          prompt:req.body.prompt+extractionPrompt,
//          referenceBooks:req.body.additionalInfo,
//          generatedSyllabus: '', // This will be filled by AI later
//        },
//      });
//      const classes = await Class.find({
//        subject:course.subject,
//        grade:course.grade
//      })
//      for(const cls of classes){
//        cls.courses.push(course._id)
//        await cls.save()
//      }
//      res.status(201).json({
//        success: true,
//        data:course,
//      });
//    } catch (error) {
//      next(error);
//    }
const course = await Course.findById("6813369ff218984487007b4f");
res.status(201).json({
  success: true,
  data:course,
});
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
      .sort({ createdAt: 1 });

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

          return {
            ...course.toObject(),
            enrollment: {
              totalStudents: enrolledStudents,
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
      }
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
export const updateCourseById=async(req:Request,res:Response,next:NextFunction)=>{
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
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { id } = req.body;

    // Prepare prompt for response generation
    const prompt = JSON.stringify(req.body) +
      " Make sure the required fields should be in camelCase format and the output should be valid JSON strictly. " +
      gradingReferencesPrompt;
    
    const data = await generateResponse(prompt);
    
    // Strip triple backticks from response
    const jsonString = data.replace(/^```(?:json|javascript)?\s*|\s*```$/g, '');
    console.log(jsonString,"jsonString")
    // Parse JSON safely
    let gradingReferences;
    try {
      gradingReferences = JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse JSON:", jsonString);
       res.status(400).json({ error: "Invalid JSON from LLM" });
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
    
     res.status(200).json({ message: "Grading reference added successfully", course });
    

  } catch (error) {
    next(error);
  }
  return res;
}

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
