// Student list for the QR Møllebakken Art Project
// This is exported as a pure JS module for use in multiple components

// Helper function to create storage-safe folder names
function createSafeFolderName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')                 // Normalize special characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9_]/g, '_')     // Replace any non-alphanumeric chars with underscore
    .replace(/_+/g, '_')             // Replace multiple underscores with single
    .replace(/^_|_$/g, '');          // Remove leading/trailing underscores
}

export const students = [
  'Adrian Årnes',
  'Aisha Adde',
  'Angel Joshua Citegetse',
  'Aron Joele Stevenson',
  'Elisei Cercea',
  'Emi Bella Mnichowska',
  'Enos Iraguha',
  'Heman Mohamed Abdulah',
  'Israel Boadi Nyamedo Appiagyei',
  'Jacob Mellingen Carpio',
  'Julie Stevenson',
  'Lukas Abemyil-Olaisen',
  'Martine Nkwano Sebagenzi',
  'Mawadah Ibrahim Mohammed',
  'Minja Aklilu Samuel',
  'Mulki Mohammed',
  'Sara-Petruta Ionas',
  'Sarolt Szofia Papdi'
].map(name => ({
  name,
  id: name.toLowerCase().replace(/\s+/g, '-'),
  folder_name: createSafeFolderName(name),
  grade: '10'  // Default grade, can be updated as needed
}));

// Helper function to get a student by ID
export function getStudentById(studentId) {
  if (!studentId) return null;
  return students.find(student => student.id === studentId) || null;
}

// Helper function to get all student IDs
export function getStudentIds() {
  return students.map(student => student.id);
}

// Export default for backwards compatibility
export default students; 