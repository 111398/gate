import { Button } from "@/shared/ui/Button";

// Редирект на /chat | /onboarding | /login будет реализован на этапе 3 (регистрация + согласия),
// когда появится сессия Supabase Auth и состояние персоны.
// Кнопка ниже — временная проверка сборки FSD/SCSS/React Aria стека, уйдёт на этапе 3.
export default function RootPage() {
  return (
    <main style={{ padding: 24 }}>
      <Button>Gate</Button>
    </main>
  );
}
