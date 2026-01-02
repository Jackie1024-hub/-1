
import { Classroom, StudentResult, GameSession } from '../types';

export const storage = {
  // Classrooms
  getClassroom: (code: string): Classroom | null => {
    const data = localStorage.getItem(`classroom:${code}`);
    return data ? JSON.parse(data) : null;
  },
  saveClassroom: (classroom: Classroom) => {
    localStorage.setItem(`classroom:${classroom.code}`, JSON.stringify(classroom));
  },
  
  // Roster
  getRoster: (code: string): StudentResult[] => {
    const data = localStorage.getItem(`roster:${code}`);
    return data ? JSON.parse(data) : [];
  },
  saveRoster: (code: string, roster: StudentResult[]) => {
    localStorage.setItem(`roster:${code}`, JSON.stringify(roster));
  },
  updateStudentResult: (code: string, result: StudentResult) => {
    const roster = storage.getRoster(code);
    const index = roster.findIndex(r => r.nickname === result.nickname);
    if (index > -1) {
      roster[index] = result;
    } else {
      roster.push(result);
    }
    storage.saveRoster(code, roster);
  },

  // Session
  getSession: (code: string, nickname: string): GameSession | null => {
    const data = localStorage.getItem(`session:${code}:${nickname}`);
    return data ? JSON.parse(data) : null;
  },
  saveSession: (code: string, nickname: string, session: GameSession) => {
    localStorage.setItem(`session:${code}:${nickname}`, JSON.stringify(session));
  },
  
  // Dev tools
  clearAll: () => {
    localStorage.clear();
  }
};
