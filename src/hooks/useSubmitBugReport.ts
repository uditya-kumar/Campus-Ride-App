import { useMutation } from "@tanstack/react-query";
import { submitBugReport, type BugReportInput } from "@/api/bugReports";

export function useSubmitBugReport(userId: string | undefined) {
  return useMutation({
    mutationFn: async (input: BugReportInput) => {
      if (!userId) throw new Error("Not signed in");
      return submitBugReport(userId, input);
    },
  });
}
