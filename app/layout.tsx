import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VAPI Integration App",
  description: "A Next.js app with Todo, Reminder, and Calendar functionality",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <div className="flex justify-between items-center">
              <h1>VAPI Integration App</h1>
              <nav className="nav">
                <a href="/">Home</a>
                <a href="/todos">Todos</a>
                <a href="/reminders">Reminders</a>
                <a href="/calendar">Calendar</a>
                <a href="/caller-id">Caller ID</a>
              </nav>
            </div>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
