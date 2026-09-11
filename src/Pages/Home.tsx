import LoginForm from "@/components/forms/login-form";
import HomeBackground from "../../public/home-bg.jpg";

export default function Home() {
  return (
    <div className="flex items-center lexend-font">
      <div className="p-8">
        <img
          src={HomeBackground}
          className="max-w-[815px] h-screen object-cover rounded-4xl"
        />
      </div>
      <div>
        <LoginForm />
      </div>
    </div>
  );
}
