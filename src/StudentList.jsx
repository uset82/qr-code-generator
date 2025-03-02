import React from 'react';

const students = [
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
  folderName: name.toLowerCase().replace(/\s+/g, '_')
}));

function StudentList({ onSelectStudent }) {
  return (
    <div className="student-list">
      <h2>Select Student</h2>
      <div className="student-grid">
        {students.map((student) => (
          <button
            key={student.id}
            className="student-button"
            onClick={() => onSelectStudent(student)}
          >
            {student.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export { students };
export default StudentList;