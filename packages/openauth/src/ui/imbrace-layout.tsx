/**
 * Imbrace-specific layout component.
 *
 * This is a standalone layout that does NOT modify the upstream `base.tsx` Layout.
 * It uses its own CSS and branding.
 *
 * @internal
 * @packageDocumentation
 */
/** @jsxImportSource hono/jsx */
import { PropsWithChildren } from "hono/jsx"
import css from "./imbrace-ui.css" with { type: "text" }
import { Language } from "./imbrace-i18n.js"

export function ImbraceLayout(
  props: PropsWithChildren<{ title?: string; lang?: string }>,
) {
  const currentYear = new Date().getFullYear()
  const lang = props.lang || "en"

  const switcherScript = `
    (function() {
      var sel = document.getElementById('imbrace-lang-switcher');
      if (sel) {
        sel.addEventListener('change', function(e) {
          var newLang = e.target.value;
          var url = new URL(window.location.href);
          url.searchParams.set('lang', newLang);
          window.location.href = url.toString();
        });
      }
    })();
  `

  return (
    <html lang={lang}>
      <head>
        <title>{props.title ?? "Sign in – iMBrace"}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <div data-imbrace="root">
          <div data-imbrace="lang-switcher-wrapper">
            <select id="imbrace-lang-switcher" data-imbrace="lang-switcher">
              <option value="en" selected={lang === "en"}>
                English
              </option>
              <option value="zh" selected={lang === "zh"}>
                繁體中文
              </option>
              <option value="cn" selected={lang === "cn"}>
                简体中文
              </option>
            </select>
          </div>
          <div data-imbrace="card">{props.children}</div>
          <footer data-imbrace="footer">
            <span>
              Powered by{" "}
              <a
                href="https://www.imbrace.co/"
                target="_blank"
                rel="noreferrer"
              >
                iMBrace Limited
              </a>{" "}
              {currentYear}.
            </span>
          </footer>
        </div>
        <script dangerouslySetInnerHTML={{ __html: switcherScript }} />
      </body>
    </html>
  )
}
