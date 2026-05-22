import { supabase } from "@/libs/supabase";

export type BugReportInput = {
  title: string;
  description: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  device_info?: string;
};

export async function submitBugReport(
  userId: string,
  input: BugReportInput,
): Promise<void> {
  const { error } = await supabase
    // bug_reports isn't in the generated types yet; cast loosens the typing
    // until `npx supabase gen types typescript` is re-run.
    .from("bug_reports" as never)
    .insert({ user_id: userId, ...input } as never);
  if (error) throw error;
}
