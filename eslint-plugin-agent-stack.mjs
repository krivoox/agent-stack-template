/** Local ESLint plugin. Not published. */
export default {
  meta: { name: "agent-stack", version: "0.1.0" },
  rules: {
    "require-define-action": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Files with \"use server\" must import defineAction or defineWorkspaceAction",
        },
        schema: [],
      },
      create(context) {
        const filename = context.filename.replaceAll("\\", "/");
        if (filename.endsWith("/src/lib/action.ts")) return {};

        return {
          Program(node) {
            const text = context.sourceCode.getText(node);
            if (!/"use server"|'use server'/.test(text)) return;
            if (
              !text.includes("defineAction") &&
              !text.includes("defineWorkspaceAction")
            ) {
              context.report({
                node,
                message:
                  'A "use server" module must import defineAction or defineWorkspaceAction from @/lib/action.',
              });
            }
          },
        };
      },
    },
  },
};
