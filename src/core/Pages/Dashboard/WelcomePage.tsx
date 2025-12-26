import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function WelcomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
                <GraduationCap className="h-10 w-10 text-primary" />
            </motion.div>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome to Course Explorer</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Manage your academic years, subjects, and exams with ease. Use the sidebar to navigate through your resources.
                </p>
            </div>
        </div>
    );
}
