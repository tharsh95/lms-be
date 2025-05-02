export const extractionPrompt = `## Syllabus Data Extraction

Please extract the following information from the provided syllabus text into a structured JavaScript object. If information for any field is not available, please use reasonable placeholder text, or generate the missing information using AI.

### Required Fields:

1. **Course Title**: Extract the full course title.

2. **Instructor**: Extract the instructor's name and title.

3. **Term**: Extract the academic term (e.g., "Fall 2023").

4. **Course Description**: Extract the full course description paragraph.

5. **Learning Objectives**: Extract all learning objectives as an array of strings.

6. **Required Materials**: Extract textbooks and materials as an array of objects with these properties:
   - title: The name of the book or material
   - author: The author's name
   - publisher: The publisher's name
   - year: Publication year
   - required: Boolean indicating if the material is required or optional

7. **Grading Policy**: Extract as an object with assessment components as properties:
   - assignments: { percentage: number, description: string }
   - participation: { percentage: number, description: string }
   - midterm: { percentage: number, description: string }
   - finalExam: { percentage: number, description: string }
   - Any other grading components found in the syllabus

8. **Weekly Schedule**: Extract as an array of objects with these properties:
   - week: week number
   - topic: weekly topic
   - readings: assigned readings
   - assignments: assignments due that week

9. **Policies**: Extract as an object with these properties:
   - attendance: attendance policy
   - lateWork: late work policy
   - academicIntegrity: academic integrity policy
   - accommodations: accommodations for students with disabilities


### Syllabus Text:`



export const gradingReferencesPrompt = `## Grading References Extraction

Please analyze the provided course syllabus and extract a structured list of grading references. These references should support the course's learning objectives, assignments, and assessments.

### Output Format:

Provide the output as a JSON array named \`gradingReferences\`, where each element is an object with the following properties:

- \`id\`: A unique identifier as a string (e.g., "1", "2", "3", ...).
- \`title\`: The title of the resource.
- \`type\`: The type of resource (e.g., "Document", "Link", "Text").
- \`added\`: The date the resource was added, formatted as "MMM DD, YYYY" (e.g., "Mar 15, 2025").
- \`usedIn\`: A brief description indicating how many assignments the resource is used in (e.g., "3 assignments").
- \`url\`: The URL of the resource, if available; otherwise, leave as an empty string.

### Instructions:

1. **Review the Syllabus:**
   - Examine the syllabus thoroughly, focusing on sections such as course description, learning objectives, required materials, grading policy, weekly schedule, and policies.

2. **Identify Relevant Resources:**
   - Determine documents, links, or texts that are pertinent to the course's assignments and assessments. These may include style guides, rubric templates, citation examples, or external writing resources.

3. **Generate Grading References:**
   - For each identified resource, create an object with the properties specified in the output format.

4. **Assumptions:**
   - If certain information (e.g., \`added\` date or \`usedIn\` count) is not explicitly mentioned in the syllabus, use reasonable estimates or placeholders.

### Example Output:

\`\`\`javascript
const gradingReferences = [
  {
    id: "1",
    title: "APA Style Guide 7th Edition",
    type: "Document",
    added: "Mar 15, 2025",
    usedIn: "3 assignments",
    url: "",
  },
  {
    id: "2",
    title: "Rubric Template - Research Papers",
    type: "Document",
    added: "Feb 28, 2025",
    usedIn: "2 assignments",
    url: "",
  },
  {
    id: "3",
    title: "Purdue OWL Writing Resources",
    type: "Link",
    added: "Mar 10, 2025",
    usedIn: "5 assignments",
    url: "https://owl.purdue.edu/owl/research_and_citation/resources.html",
  },
  {
    id: "4",
    title: "Psychology Journal Citation Examples",
    type: "Text",
    added: "Mar 5, 2025",
    usedIn: "1 assignment",
    url: "",
  },
  {
    id: "5",
    title: "Harvard Referencing Guide",
    type: "Link",
    added: "Feb 20, 2025",
    usedIn: "4 assignments",
    url: "https://www.citethisforme.com/harvard-referencing",
  },
];
\`\`\`

### Syllabus Text:
`;
