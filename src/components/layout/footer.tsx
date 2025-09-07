import Link from "next/link";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="bg-background py-16">
      <div className="pl-12 pr-8 md:px-16 lg:px-24 xl:px-32 md:mx-auto md:max-w-5xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 mb-16">
          {/* Product Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              {locale === "en" ? "Product" : "產品"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={`/${locale}/insurance`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Insurance" : "保險商品"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/policies`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "My Policies" : "我的保單"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/agents`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Find Agents" : "尋找業務員"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Dashboard" : "儀表板"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              {locale === "en" ? "Features" : "功能"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={`/${locale}/compare`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Compare" : "比較"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/matching`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Smart Matching" : "智慧媒合"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/calculator`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Premium Calculator" : "保費計算"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/insights`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Insurance Insights" : "保險洞察"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              {locale === "en" ? "Support" : "支援"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={`/${locale}/help`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Help Center" : "幫助中心"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Contact Support" : "聯絡客服"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Guides" : "使用指南"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/status`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "System Status" : "系統狀態"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              {locale === "en" ? "Company" : "公司"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "About Us" : "關於我們"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/careers`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Careers" : "職缺"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Blog" : "部落格"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/news`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "News" : "最新消息"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              {locale === "en" ? "Legal" : "法律"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Privacy Policy" : "隱私政策"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Terms of Service" : "服務條款"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/security`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Security" : "安全性"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/cookies`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === "en" ? "Cookie Policy" : "Cookie 政策"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-8 border-t border-border/20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight">
                Prinsur
              </span>
              <span className="text-xs text-muted-foreground">
                {locale === "en" ? "Smart Insurance Platform" : "智慧保險平台"}
              </span>
            </div>
          </div>

          {/* Copyright and Links */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>© 2024 Prinsur</span>
              <Link
                href={`/${locale}/sitemap`}
                className="hover:text-foreground transition-colors"
              >
                {locale === "en" ? "Sitemap" : "網站地圖"}
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-muted-foreground">
                {locale === "en" ? "Made in" : "製作於"}
              </span>
              {/* <span className="text-xs">🇹🇼</span> */}
              <span className="text-xs text-muted-foreground">Taiwan</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
