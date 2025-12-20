import { useState } from "react";
import { z } from "zod";
import TextInput from "../../components/level-0/TextInput/TextInput";
import Button from "../../components/level-0/Button/Bottom";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import styles from "./LoginView.module.css";
import loginVisual from "../../assets/images/Login.webp"; 

const loginSchema = z.object({
  id: z.string()
    .min(1, "ID is required")
    .regex(/^\d+$/, "ID must contain numbers only"), 
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginView() {
  const [formData, setFormData] = useState<Partial<LoginFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      console.log("Login Data:", formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) errorMap[err.path[0].toString()] = err.message;
        });
        setErrors(errorMap);
      }
    }
  };

  return (
    <div className={styles.container}>
      <AdjustableCard className={styles.loginCard} height="auto">
        <div className={styles.splitLayout}>
          <div className={styles.formSection}>
            <div className={styles.header}>
              <h1 className={styles.title}>WELCOME BACK</h1>
              <p className={styles.subtitle}>Enter your ID to access your dashboard</p>
            </div>

            <div className={styles.form}>
              <TextInput
                label="User ID"
                type="text"
                placeholder="Ex: 123456"
                value={formData.id || ""}
                onChange={(v) => setFormData({ ...formData, id: v })}
                error={errors.id}
              />
              <TextInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password || ""}
                onChange={(v) => setFormData({ ...formData, password: v })}
                error={errors.password}
              />
              <Button 
                variant="primary" 
                onClick={handleLogin} 
                width="100%"
                className={styles.loginBtn}
              >
                Sign In
              </Button>

            </div>
          </div>

          <div className={styles.visualSection}>
            <img src={loginVisual} alt="Football Background" className={styles.bgImage} />
            <div className={styles.overlay}>
              <div className={styles.quote}>
                <h2>ONE TEAM ONE DREAM</h2>
                <p>Track your performance and recovery in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </AdjustableCard>
    </div>
  );
}

export default LoginView;