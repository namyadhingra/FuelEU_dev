# Reflection on AI-Assisted Development

This document summarizes my experience using AI agents while building the FuelEU Maritime full-stack compliance application. The development process relied on three tools acting in complementary roles: Cursor, GitHub Copilot, and ChatGPT. Each provided a distinct level of support across planning, architecture, and code implementation.

## What I Learned Using AI Agents

> Working with multiple agents taught me how to treat AI as a collaborator, not an autopilot:

> AI agents excel when given clear, constrained prompts and precise file paths.

> Complex features (e.g., banking, pooling) require domain understanding first, then letting the agent write the boilerplate.

> The best workflow was ChatGPT for reasoning → Cursor for implementation → Copilot for refinement.

> Agents do not naturally enforce architecture boundaries, so I learned to maintain hexagonal structure manually and correct deviations.

> The most important lesson: AI accelerates coding, but architectural clarity still comes from the developer.


## Efficiency Gains Compared to Manual Coding

> AI significantly reduced the time spent on mechanical or repetitive coding tasks:

> Cursor generated full repository classes, migrations, controllers, and React components in minutes rather than hours.

> Copilot accelerated typing flow, especially for props, repetitive mapping logic, and TS definitions.

> ChatGPT helped break down the assignment into a clear step-by-step plan and prevented mental overload.

> Test writing was faster because agents could draft initial test templates.

> Overall, I estimate a 40–60% reduction in development time, especially in the backend where ports, repos, and controllers follow patterns.

> However, efficiency gains only appeared when I validated everything, especially numeric conversions, DB transactions, import paths, and React hook dependencies.

## Improvements I Would Make Next Time

> Through this project, I identified several improvements for future AI-assisted development:

> Adopt smaller, iterative prompts instead of large multi-file generation requests. This reduces hallucinations and mismatched imports.

> Write tests before prompts for core logic, so the agent’s code is instantly verifiable.

> Establish a prompt template library (e.g., “Generate repo implementing port X”, “Generate controller Y with validations”).

> Use fewer “one-shot” large outputs and prefer task-based prompting in Cursor for incremental correctness.

> Allocate more time for manual architecture review, ensuring all generated code respects boundaries and naming conventions.

## Closing Thoughts

> AI agents provided substantial acceleration and reduced cognitive load, but they did not replace thoughtful engineering.
> The combination of human architectural judgment + AI code generation was the most effective approach.
> This project highlighted that AI helps most with execution, while design, validation, and domain reasoning must remain the developer’s responsibility.