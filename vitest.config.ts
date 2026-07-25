import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        include: ["**/*.test.ts"],
        exclude: ["node_modules", ".next", "supabase"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["app/api/**/*.ts", "lib/**/*.ts"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
});
