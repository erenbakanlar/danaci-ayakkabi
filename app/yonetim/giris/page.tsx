import { LoginForm } from "@/app/yonetim/giris/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-10 max-w-sm border border-border bg-background p-8">
      <h1 className="text-2xl font-medium tracking-tight">Yönetim paneli</h1>
      <p className="mt-2 text-sm text-muted">Ürün, fiyat ve fotoğrafları düzenlemek için giriş yapın.</p>
      <LoginForm />
    </div>
  );
}
