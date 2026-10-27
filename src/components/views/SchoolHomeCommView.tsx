import StudentDirectory from "../StudentDirectory";
export function SchoolHomeCommView({
  showToast,
  focusStudentId,
}: {
  showToast: (message: string) => void;
  onNavigateToStudentProfile?: () => void;
  focusStudentId?: string;
}) {
  return (
    <StudentDirectory
      showToast={showToast}
      careOnly
      focusStudentId={focusStudentId}
    />
  );
}
