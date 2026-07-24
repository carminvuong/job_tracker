import Anthropic from "@anthropic-ai/sdk";

export type ExtractedJobDetails = {
  company: string;
  role: string;
  location: string | null;
};

const EXTRACT_TOOL = {
  name: "extract_job_details",
  description:
    "Extract the hiring company's name, the job title/role, and the job location from job posting page content.",
  input_schema: {
    type: "object" as const,
    properties: {
      company: { type: "string", description: "The hiring company's name" },
      role: { type: "string", description: "The job title/role being applied for" },
      location: {
        type: "string",
        description: "The job location (city/remote/etc), or an empty string if not stated",
      },
    },
    required: ["company", "role", "location"],
  },
};

export async function extractJobDetails(pageText: string): Promise<ExtractedJobDetails> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set — auto-fill is disabled");
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "extract_job_details" },
    messages: [
      {
        role: "user",
        content: `Extract the company name, job role/title, and location from this job posting page content:\n\n${pageText}`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Could not extract job details from this page");
  }

  const input = toolUse.input as { company?: string; role?: string; location?: string };
  return {
    company: input.company?.trim() ?? "",
    role: input.role?.trim() ?? "",
    location: input.location?.trim() || null,
  };
}
