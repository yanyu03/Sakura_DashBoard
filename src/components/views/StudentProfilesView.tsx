import StudentDirectory from "../StudentDirectory";
export function StudentProfilesView({
  showToast,
  focusStudentId,
}: {
  showToast: (message: string) => void;
  onNavigateToChat?: () => void;
  focusStudentId?: string;
}) {
  return (
    <StudentDirectory showToast={showToast} focusStudentId={focusStudentId} />
  );
}
