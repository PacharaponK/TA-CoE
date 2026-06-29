export class CreateStudentDto {
  firstName: string;
  surname: string;
  nickname?: string;
  studentId: string;
  year: number;
  section?: string;
  email?: string;
  phone?: string;
}

export class UpdateStudentDto {
  firstName?: string;
  surname?: string;
  nickname?: string;
  year?: number;
  section?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}
