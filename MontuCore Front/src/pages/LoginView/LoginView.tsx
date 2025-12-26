import { useState } from "react";
import { z } from "zod";
import TextInput from "../../components/level-0/TextInput/TextInput";
import Button from "../../components/level-0/Button/Bottom";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import styles from "./LoginView.module.css";
import loginVisual from "../../assets/images/Login.webp"; 
import { useLogin } from "../../hooks/useLogin";
// import { useAuth } from "../../context/AuthContext"; // Not strictly needed unless you want to use 'user' right here

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginView() {
  const [formData, setFormData] = useState<Partial<LoginFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { mutate: loginUser, isPending, error: apiError } = useLogin();
  
  const handleLogin = () => {
    try {
      // 1. Validate State Data
      const validData = loginSchema.parse(formData);
      setErrors({});

      // 2. Call API
      loginUser(
        { email: validData.email, password: validData.password }, 
        {
          onSuccess: (data) => {
             // 'data' here is the response from the API (LoginResponse)
             alert(`Logged in as: ${data.result.user.fullName}`);
             // Navigate here if needed, e.g., navigate('/dashboard');
          }
        }
      );
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
              <p className={styles.subtitle}>Enter your email to access your dashboard</p>
            </div>

            <div className={styles.form}>
              <TextInput
                label="Email"
                type="email"
                placeholder="Ex: user@example.com"
                value={formData.email || ""}
                onChange={(v) => setFormData({ ...formData, email: v })}
                error={errors.email}
              />
              <TextInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password || ""}
                onChange={(v) => setFormData({ ...formData, password: v })}
                error={errors.password}
              />
              
              {/* Show API Error if exists */}
              {apiError && <div style={{color: 'red', marginBottom: '10px'}}>{apiError.message}</div>}

              <Button 
                variant="primary" 
                onClick={handleLogin} 
                width="100%"
                className={styles.loginBtn}
                disabled={isPending}
              >
                {isPending ? "Signing In..." : "Sign In"}
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