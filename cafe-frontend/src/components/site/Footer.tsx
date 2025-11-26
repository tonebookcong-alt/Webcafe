export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/5 bg-coffee-900/60">
      <div className="container-base py-8 text-sm text-white/70">
        <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Serenite Café</p>
          <p>Giờ mở cửa: Thứ 2–CN 07:00 – 21:00</p>
        </div>
      </div>
    </footer>
  );
}
