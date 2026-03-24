/**
 * UI components for the Imbrace authentication flow.
 *
 * These components use `ImbraceLayout` (not the upstream `Layout` from base.tsx)
 * to avoid breaking other providers' UI.
 *
 * @packageDocumentation
 */
/** @jsxImportSource hono/jsx */
import { ImbraceLayout } from "./imbrace-layout.js"
import type { JSX } from "hono/jsx/jsx-runtime"
import { PasswordConfig } from "../provider/password.js"
import { t } from "./imbrace-i18n.js"

// ---------------------------------------------------------------------------
// Social provider button config
// ---------------------------------------------------------------------------

export interface SocialProviderButton {
  label: string
  icon?: JSX.Element
  providerKey?: string
}

// ---------------------------------------------------------------------------
// Pre-built social icons
// ---------------------------------------------------------------------------

const IconGoogle = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.5791 11.2356C21.5791 10.5186 21.5144 9.80164 21.3852 9.10239H11.2222V13.1508H17.0371C16.8028 14.4187 16.0356 15.5332 14.9372 16.248L14.917 16.3784L18.2561 18.9142L18.4871 18.9368C20.6127 17.0163 21.5791 14.3912 21.5791 11.2356Z"
      fill="#4285F4"
    />
    <path
      d="M11.2222 21.5544C14.0894 21.5544 16.4962 20.6272 18.2562 18.9142L14.9372 16.248C14.0327 16.8532 12.8778 17.2109 11.2222 17.2109C8.4602 17.2109 6.12608 15.3842 5.28616 12.9242L5.15934 12.9348L1.69467 15.5562L1.64941 15.6756C3.39373 19.0706 6.99589 21.5544 11.2222 21.5544Z"
      fill="#34A853"
    />
    <path
      d="M5.28616 12.9242C5.0681 12.2882 4.94695 11.6062 4.94695 10.9002C4.94695 10.1942 5.0681 9.51221 5.28616 8.87621V8.74579L1.78201 6.0827L1.64941 6.12481C0.906385 7.57002 0.482422 9.19139 0.482422 10.9002C0.482422 12.609 0.906385 14.2304 1.64941 15.6756L5.28616 12.9242Z"
      fill="#FBBC05"
    />
    <path
      d="M11.2222 4.58989C13.1929 4.58989 14.5174 5.42617 15.2766 6.13029L18.337 3.20306C16.4881 1.51139 14.0813 0.245972 11.2222 0.245972C6.99589 0.245972 3.39373 2.73024 1.64941 6.12481L5.28616 8.87621C6.12608 6.41621 8.4602 4.58989 11.2222 4.58989Z"
      fill="#EA4335"
    />
  </svg>
)

const IconMicrosoft = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10.45 0.475098H0.475098V10.4501H10.45V0.475098Z" fill="#F25022" />
    <path
      d="M21.3751 0.475098H11.4001V10.4501H21.3751V0.475098Z"
      fill="#7FBA00"
    />
    <path d="M10.45 11.4001H0.475098V21.3751H10.45V11.4001Z" fill="#00A4EF" />
    <path
      d="M21.3751 11.4001H11.4001V21.3751H21.3751V11.4001Z"
      fill="#FFB900"
    />
  </svg>
)

const IconAzureAD = () => (
  <svg
    height="2359"
    width="2500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-0.4500000000000005 0.38 800.8891043012813 754.2299999999999"
    style="width: 22px; position: absolute; left: 17px;"
  >
    <linearGradient
      id="a"
      gradientUnits="userSpaceOnUse"
      x1="353.1"
      x2="107.1"
      y1="56.3"
      y2="783"
    >
      <stop offset="0" stop-color="#114a8b"></stop>
      <stop offset="1" stop-color="#0669bc"></stop>
    </linearGradient>
    <linearGradient
      id="b"
      gradientUnits="userSpaceOnUse"
      x1="429.8"
      x2="372.9"
      y1="394.9"
      y2="414.2"
    >
      <stop offset="0" stop-opacity="0.3"></stop>
      <stop offset="0.1" stop-opacity="0.2"></stop>
      <stop offset="0.3" stop-opacity="0.1"></stop>
      <stop offset="0.6" stop-opacity="0.1"></stop>
      <stop offset="1" stop-opacity="0"></stop>
    </linearGradient>
    <linearGradient
      id="c"
      gradientUnits="userSpaceOnUse"
      x1="398.4"
      x2="668.4"
      y1="35.1"
      y2="754.4"
    >
      <stop offset="0" stop-color="#3ccbf4"></stop>
      <stop offset="1" stop-color="#2892df"></stop>
    </linearGradient>
    <path
      d="M266.71.4h236.71L257.69 728.9a37.8 37.8 0 0 1-5.42 10.38c-2.33 3.16-5.14 5.93-8.33 8.22s-6.71 4.07-10.45 5.27-7.64 1.82-11.56 1.82H37.71c-5.98 0-11.88-1.42-17.2-4.16A37.636 37.636 0 0 1 7.1 738.87a37.762 37.762 0 0 1-6.66-16.41c-.89-5.92-.35-11.97 1.56-17.64L230.94 26.07c1.25-3.72 3.08-7.22 5.42-10.38 2.33-3.16 5.15-5.93 8.33-8.22 3.19-2.29 6.71-4.07 10.45-5.27S262.78.38 266.7.38v.01z"
      fill="url(#a)"
    ></path>
    <path
      d="M703.07 754.59H490.52c-2.37 0-4.74-.22-7.08-.67-2.33-.44-4.62-1.1-6.83-1.97s-4.33-1.95-6.34-3.21a38.188 38.188 0 0 1-5.63-4.34l-241.2-225.26a17.423 17.423 0 0 1-5.1-8.88 17.383 17.383 0 0 1 7.17-18.21c2.89-1.96 6.3-3.01 9.79-3.01h375.36l92.39 265.56z"
      fill="#0078d4"
    ></path>
    <path
      d="M504.27.4l-165.7 488.69 270.74-.06 92.87 265.56H490.43c-2.19-.02-4.38-.22-6.54-.61s-4.28-.96-6.34-1.72a38.484 38.484 0 0 1-11.36-6.51L303.37 593.79l-45.58 134.42c-1.18 3.36-2.8 6.55-4.82 9.48a40.479 40.479 0 0 1-16.05 13.67 40.03 40.03 0 0 1-10.13 3.23H37.82c-6.04.02-12-1.42-17.37-4.2A37.664 37.664 0 0 1 .43 722a37.77 37.77 0 0 1 1.87-17.79L230.87 26.58c1.19-3.79 2.98-7.36 5.3-10.58 2.31-3.22 5.13-6.06 8.33-8.4s6.76-4.16 10.53-5.38S262.75.38 266.72.4h237.56z"
      fill="url(#b)"
    ></path>
    <path
      d="M797.99 704.82a37.847 37.847 0 0 1 1.57 17.64 37.867 37.867 0 0 1-6.65 16.41 37.691 37.691 0 0 1-30.61 15.72H498.48c5.98 0 11.88-1.43 17.21-4.16 5.32-2.73 9.92-6.7 13.41-11.56s5.77-10.49 6.66-16.41.35-11.97-1.56-17.64L305.25 26.05a37.713 37.713 0 0 0-13.73-18.58c-3.18-2.29-6.7-4.06-10.43-5.26S273.46.4 269.55.4h263.81c3.92 0 7.81.61 11.55 1.81 3.73 1.2 7.25 2.98 10.44 5.26 3.18 2.29 5.99 5.06 8.32 8.21s4.15 6.65 5.41 10.37l228.95 678.77z"
      fill="url(#c)"
    ></path>
  </svg>
)

const IconEye = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconEyeOff = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
)

const IconInfo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const IconCheckCircle = ({ color = "#d1d5db" }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="16"
    height="16"
    style={{
      color,
      display: "inline-block",
      marginLeft: "5px",
      verticalAlign: "middle",
    }}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

const IconHighlightOff = ({ color = "#d1d5db" }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="16"
    height="16"
    style={{
      color,
      display: "inline-block",
      marginLeft: "5px",
      verticalAlign: "middle",
    }}
  >
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
  </svg>
)

const ImbracePasswordField = ({
  id,
  label,
  name,
  placeholder = "••••••••",
  required = true,
  autofocus = false,
  showTooltip = false,
  lang,
}: {
  id: string
  label: string
  name: string
  placeholder?: string
  required?: boolean
  autofocus?: boolean
  showTooltip?: boolean
  lang?: string
}) => (
  <div data-imbrace="field">
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0.375rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <label
          data-imbrace="label"
          for={id}
          style={{ marginBottom: 0, fontWeight: 600 }}
        >
          {label}
        </label>
        {showTooltip && (
          <div class="imbrace-tooltip">
            <div
              data-imbrace="icon-btn"
              tabindex={-1}
              style={{ width: "20px", height: "20px" }}
            >
              <IconInfo />
            </div>
            <div class="tooltip-text" style={{ bottom: "unset", top: "-20px" }}>
              <div class="tooltip-title">
                {t(lang, "common.password_requirements")}
              </div>
              <ul class="tooltip-list">
                <li>{t(lang, "common.req.length")}</li>
                <li>{t(lang, "common.req.lower")}</li>
                <li>{t(lang, "common.req.upper")}</li>
                <li>{t(lang, "common.req.number")}</li>
                <li>{t(lang, "common.req.special")}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
    <div data-imbrace="input-wrapper">
      <input
        data-imbrace="input"
        id={id}
        type="password"
        name={name}
        required={required}
        autofocus={autofocus}
        placeholder={placeholder}
        oninvalid={`this.setCustomValidity('${t(lang, "login.password")}')`}
        oninput={`this.setCustomValidity('')`}
      />
      <div data-imbrace="input-icons">
        <button
          type="button"
          data-imbrace="icon-btn"
          onclick={`(function() {
            var btn = event.currentTarget;
            var input = document.getElementById('${id}');
            var isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btn.innerHTML = isPass 
              ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z" /><circle cx="12" cy="12" r="3" /></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>';
          })()`}
          title="Toggle password visibility"
        >
          <IconEyeOff />
        </button>
      </div>
    </div>
  </div>
)

export const GOOGLE_BUTTON: SocialProviderButton = {
  label: "Continue with Google",
  icon: <IconGoogle />,
  providerKey: "google",
}

export const MICROSOFT_BUTTON: SocialProviderButton = {
  label: "Continue with Microsoft",
  icon: <IconMicrosoft />,
  providerKey: "microsoft",
}

export const AZURE_AD_BUTTON: SocialProviderButton = {
  label: "Sign in with Azure AD",
  icon: <IconAzureAD />,
  providerKey: "azure-ad",
}

export const KEYCLOAK_BUTTON: SocialProviderButton = {
  label: "Continue with Keycloak",
  providerKey: "keycloak",
}

export const OKTA_BUTTON: SocialProviderButton = {
  label: "Continue with Okta",
  providerKey: "okta",
}

export const AUTHENTIK_BUTTON: SocialProviderButton = {
  label: "Continue with Authentik",
  providerKey: "authentik",
}

// ---------------------------------------------------------------------------
// Imbrace Logo
// ---------------------------------------------------------------------------

function ImbraceLogo() {
  return (
    <svg
      viewBox="0 0 236 81"
      width="180"
      height="62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="imbrace_logo_vn7w1"
    >
      <path
        d="M44.1487 56.1984C40.3956 56.1984 37.6958 55.2238 36.0491 53.2747C34.4028 51.3528 33.5929 48.104 33.5929 43.556V31.6443H27.1946V25.2728H41.5034V43.556C41.3611 45.3164 41.7465 47.0793 42.6101 48.6187C43.0676 49.1541 43.6484 49.5695 44.3022 49.8289C44.956 50.0884 45.6631 50.184 46.362 50.1075H52.6759V56.1984H44.1487Z"
        fill="#FA9917"
      ></path>
      <path
        d="M54.1088 41.0199H59.6528C59.9029 41.0199 60.1427 41.1196 60.3196 41.2969C60.4964 41.4742 60.5958 41.7147 60.5958 41.9655V48.7712C60.5958 49.022 60.4964 49.2625 60.3196 49.4398C60.1427 49.6171 59.9029 49.7168 59.6528 49.7168H54.1088C53.8587 49.7168 53.6188 49.6171 53.442 49.4398C53.2651 49.2625 53.1658 49.022 53.1658 48.7712V41.9655C53.1658 41.7147 53.2651 41.4742 53.442 41.2969C53.6188 41.1196 53.8587 41.0199 54.1088 41.0199Z"
        fill="#156DF2"
      ></path>
      <path
        d="M52.3549 21.0234L56.2959 17.3776L41.0367 0.790787L40.9807 0.842685L40.9701 0.831052L0.143066 38.5982L0.26556 38.7316L0.201147 38.7909L15.4603 55.3777L19.4013 51.7319L7.49177 38.7867L40.5572 8.20001L52.3549 21.0234Z"
        fill="#626262"
      ></path>
      <path
        d="M28.7723 60.6522L24.8313 64.298L40.0905 80.8848L40.1465 80.8329L40.157 80.8445L80.9841 43.0742L80.8616 42.9408L80.926 42.8815L65.6721 26.2947L61.7311 29.9405L73.6396 42.8857L40.5741 73.4724L28.7723 60.6522Z"
        fill="#626262"
      ></path>
      <path
        d="M106.876 64.0968C103.489 64.0968 101.051 63.2168 99.5644 61.4569C98.0776 59.7224 97.3468 56.7892 97.3468 52.6838V41.9327H91.5706V36.4337H104.488V52.6848C104.359 54.274 104.707 55.8655 105.486 57.2551C105.9 57.7382 106.424 58.113 107.015 58.3472C107.605 58.5813 108.243 58.6677 108.874 58.5989H114.577V64.0978L106.876 64.0968ZM98.0786 33.1829C97.9794 33.197 97.8782 33.1878 97.7831 33.156C97.688 33.1242 97.6017 33.0706 97.5308 32.9995C97.4599 32.9284 97.4064 32.8418 97.3747 32.7464C97.343 32.6511 97.3338 32.5497 97.3479 32.4501V25.5587C97.3338 25.4592 97.343 25.3578 97.3747 25.2624C97.4064 25.1671 97.4599 25.0804 97.5308 25.0093C97.6017 24.9382 97.688 24.8847 97.7831 24.8528C97.8782 24.821 97.9794 24.8118 98.0786 24.826H103.757C103.856 24.8118 103.957 24.821 104.052 24.8528C104.147 24.8847 104.234 24.9382 104.305 25.0093C104.376 25.0804 104.429 25.1671 104.461 25.2624C104.492 25.3578 104.502 25.4592 104.488 25.5587V32.4501C104.502 32.5497 104.492 32.6511 104.461 32.7464C104.429 32.8418 104.376 32.9284 104.305 32.9995C104.234 33.0706 104.147 33.1242 104.052 33.156C103.957 33.1878 103.856 33.197 103.757 33.1829H98.0786Z"
        fill="#FA9917"
      ></path>
      <path
        d="M149.633 58.0674C148.603 57.3571 147.79 56.3738 147.285 55.2273L146.736 58.547H141.649L141.622 24.8313H147.285V39.762C147.868 38.6722 148.705 37.74 149.724 37.0447C150.687 36.4203 151.818 36.1079 152.963 36.15C154.106 36.1121 155.239 36.3631 156.259 36.8797C157.279 37.3964 158.153 38.1621 158.801 39.1065C160.12 40.9733 160.876 43.7741 160.876 47.5672C160.876 51.1262 160.217 54.0265 158.82 56.0469C158.192 56.9941 157.333 57.7647 156.325 58.2855C155.317 58.8063 154.193 59.06 153.059 59.0225C151.847 59.0589 150.652 58.7259 149.633 58.0674ZM154.152 52.561C154.843 51.006 155.2 49.3228 155.2 47.6206C155.2 45.9184 154.843 44.2353 154.152 42.6803C153.883 42.1429 153.47 41.6911 152.96 41.3753C152.45 41.0595 151.862 40.8921 151.262 40.8918C150.66 40.8942 150.071 41.0623 149.558 41.3777C149.045 41.693 148.628 42.1437 148.353 42.6803C147.65 44.2318 147.286 45.9163 147.286 47.6206C147.286 49.3249 147.65 51.0094 148.353 52.561C148.628 53.0978 149.045 53.5486 149.558 53.8642C150.071 54.1798 150.66 54.348 151.262 54.3506C151.862 54.3498 152.449 54.1821 152.959 53.8661C153.47 53.5501 153.882 53.0983 154.151 52.561H154.152Z"
        fill="#156DF2"
      ></path>
      <path
        d="M162.002 36.8298L166.905 36.8129L167.586 40.0542C168.131 38.9108 169.028 37.9732 170.145 37.3794C171.373 36.7426 172.739 36.4217 174.121 36.4454C174.91 36.4448 175.697 36.5289 176.468 36.6964C177.205 36.9463 177.915 37.2727 178.585 37.6706V42.477C177.945 41.9439 177.207 41.5413 176.413 41.292C175.527 41.0183 174.605 40.885 173.679 40.8971C172.597 40.8744 171.522 41.0699 170.517 41.472C169.664 41.8076 168.933 42.3965 168.422 43.1599C168.098 43.6676 167.881 44.2357 167.782 44.8299C167.623 45.8026 167.558 46.7884 167.588 47.7737L167.651 58.5491H161.999L162.002 36.8298Z"
        fill="#156DF2"
      ></path>
      <path
        d="M178.581 57.0582C177.869 56.3419 177.317 55.4832 176.959 54.5382C176.602 53.5932 176.447 52.5832 176.506 51.5741C176.418 50.5028 176.597 49.4264 177.027 48.4418C177.457 47.4571 178.125 46.5951 178.969 45.9333C180.617 44.7275 183.158 44.1246 186.591 44.1246H190.529V43.1716C190.551 42.7667 190.472 42.3627 190.299 41.996C190.126 41.6293 189.865 41.3114 189.54 41.0708C188.619 40.5349 187.557 40.2909 186.495 40.3708C185.199 40.3771 183.909 40.5468 182.655 40.8759C181.263 41.269 179.922 41.8238 178.659 42.5289V37.6663C179.891 37.157 181.172 36.7725 182.48 36.5185C183.92 36.2533 185.38 36.1232 186.844 36.1299C190.471 36.1299 192.643 37.0246 194 38.3281C195.396 39.7291 196.172 41.8872 196.172 45.9322C196.172 47.3713 196.075 52.1798 196.075 53.1328C196.075 53.6782 196.094 54.2606 196.114 54.6301C196.173 55.1596 196.192 55.6996 196.251 56.03C196.313 56.4699 196.404 56.9052 196.522 57.3335C196.643 57.76 196.817 58.1698 197.039 58.5534H191.388C191.183 58.1648 191.019 57.756 190.898 57.3335C190.778 56.9067 190.693 56.4708 190.645 56.03C189.926 56.9875 188.979 57.7497 187.891 58.2474C186.379 58.9185 184.712 59.1627 183.072 58.9537C181.431 58.7447 179.879 58.0904 178.582 57.0614L178.581 57.0582ZM190.439 53.3626C191.352 51.9564 191.788 50.2922 191.681 48.6176V48.229H189.412C187.886 48.1025 186.353 48.3842 184.97 49.0454C184.537 49.3546 184.193 49.7724 183.972 50.2571C183.75 50.7418 183.66 51.2763 183.71 51.807C183.678 52.245 183.739 52.6848 183.89 53.0972C184.04 53.5096 184.277 53.8852 184.583 54.1992C184.903 54.501 185.282 54.7341 185.695 54.8845C186.109 55.0349 186.548 55.0993 186.987 55.0738C187.66 55.1032 188.329 54.9617 188.932 54.6626C189.536 54.3634 190.054 53.9162 190.439 53.3626Z"
        fill="#156DF2"
      ></path>
      <path
        d="M199.748 55.8775C197.91 53.5279 196.913 50.6272 196.917 47.641C196.92 44.6548 197.925 41.7565 199.768 39.4114C200.798 38.3987 202.026 37.612 203.375 37.1015C204.724 36.591 206.164 36.3679 207.604 36.4465C208.753 36.4421 209.899 36.5761 211.017 36.8457C212.134 37.1317 213.214 37.5464 214.237 38.0814V43.1769C213.422 42.4979 212.506 41.9525 211.522 41.561C210.53 41.1866 209.478 40.9996 208.418 41.0093C207.625 40.9538 206.831 41.0809 206.094 41.3808C205.358 41.6807 204.7 42.1455 204.171 42.7396C203.197 44.193 202.677 45.9042 202.677 47.6551C202.677 49.4059 203.197 51.1171 204.171 52.5705C204.71 53.1563 205.373 53.6139 206.112 53.91C206.85 54.206 207.645 54.3331 208.438 54.2817C209.491 54.2847 210.536 54.0982 211.523 53.7311C212.523 53.3633 213.444 52.8085 214.238 52.0961V57.2107C213.27 57.756 212.233 58.1654 211.154 58.4274C210.014 58.7237 208.84 58.8662 207.663 58.851C206.21 58.9375 204.755 58.7175 203.391 58.2054C202.028 57.6932 200.787 56.9002 199.748 55.8775Z"
        fill="#156DF2"
      ></path>
      <path
        d="M218.247 56.0851C216.327 54.1208 215.357 51.3199 215.357 47.6826C215.357 44.0452 216.268 41.3228 218.13 39.2421C219.094 38.1993 220.274 37.3817 221.588 36.8474C222.902 36.3131 224.317 36.075 225.733 36.15C227.108 36.076 228.483 36.2922 229.769 36.7847C231.056 37.2772 232.224 38.035 233.2 39.0091C235.043 40.9733 235.857 43.7551 235.857 47.1002V49.415H221.136C221.088 50.1262 221.199 50.8392 221.461 51.5019C221.722 52.1647 222.128 52.7606 222.649 53.2461C223.936 54.1759 225.508 54.6234 227.09 54.5105C228.403 54.5056 229.709 54.3156 230.969 53.9461C232.36 53.5087 233.694 52.9081 234.945 52.1565V57.3886C233.644 57.9289 232.292 58.3393 230.911 58.6138C229.513 58.8943 228.089 59.0312 226.664 59.0225C222.882 59.0215 220.186 58.0515 218.247 56.0851ZM230.141 45.1328C230.215 43.8862 229.805 42.6593 228.996 41.7093C228.558 41.3083 228.043 41 227.483 40.8028C226.924 40.6056 226.33 40.5235 225.737 40.5614C225.157 40.5291 224.577 40.6179 224.033 40.8223C223.489 41.0266 222.993 41.342 222.577 41.7485C221.741 42.69 221.256 43.8925 221.204 45.1518L230.141 45.1328Z"
        fill="#156DF2"
      ></path>
      <path
        d="M114.726 36.8361L119.644 36.7557L119.793 39.0471C120.197 38.194 120.864 37.493 121.694 37.0469C122.601 36.5609 123.615 36.3122 124.643 36.3237C125.669 36.3092 126.68 36.5725 127.57 37.0861C127.952 37.2749 128.293 37.5394 128.571 37.8637C128.849 38.188 129.059 38.5653 129.187 38.973C129.655 38.1326 130.347 37.4395 131.185 36.9717C132.13 36.5016 133.177 36.2787 134.231 36.3237C136.538 36.3237 138.108 37.0098 138.941 38.2297C139.869 39.5819 140.249 42.1932 140.249 46.1556L140.327 58.5513H134.675L134.54 44.4794C134.637 43.4041 134.482 42.3211 134.088 41.3164C133.92 41.038 133.677 40.8132 133.386 40.6681C133.096 40.523 132.77 40.4636 132.447 40.4968C132.118 40.4542 131.783 40.5113 131.487 40.6607C131.19 40.8102 130.944 41.0451 130.782 41.3355C130.382 42.3321 130.219 43.4085 130.306 44.4794L130.343 58.5513H124.691L124.668 44.4794C124.744 43.4027 124.582 42.3224 124.191 41.3164C123.997 41.0631 123.747 40.8577 123.462 40.7158C123.176 40.5738 122.862 40.499 122.543 40.4972C122.224 40.4954 121.909 40.5665 121.622 40.7052C121.334 40.8438 121.083 41.0463 120.885 41.2973C120.495 42.3098 120.341 43.398 120.433 44.4794V58.5174H114.724L114.726 36.8361Z"
        fill="#156DF2"
      ></path>
      <path
        d="M178.585 37.6706H178.659V42.5331L178.582 42.4812L178.585 37.6706Z"
        fill="#156DF2"
      ></path>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Login Form
// ---------------------------------------------------------------------------

export interface ImbraceLoginFormProps {
  social?: SocialProviderButton[]
  error?: string
  forgotPasswordUrl?: string
  signUpUrl?: string
  lang?: string
}

export function ImbraceLoginForm({
  social = [],
  error,
  forgotPasswordUrl,
  signUpUrl,
  lang,
}: ImbraceLoginFormProps) {
  const activeSocial = social.filter((s) => s.providerKey)
  return (
    <ImbraceLayout lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "login.title")}</h1>
      {error && <div data-imbrace="error">{error}</div>}
      <form data-imbrace="form" method="post">
        <input type="hidden" name="action" value="login" />
        <div data-imbrace="field">
          <label data-imbrace="label" for="email">
            {t(lang, "login.email")}
          </label>
          <input
            data-imbrace="input"
            id="email"
            type="email"
            name="email"
            required
            autofocus
          />
        </div>
        <ImbracePasswordField
          id="password"
          label={t(lang, "login.password")}
          name="password"
          required
          showTooltip={true}
          lang={lang}
        />
        {forgotPasswordUrl && (
          <a data-imbrace="forgot" href={forgotPasswordUrl}>
            {t(lang, "login.forgot_password")}
          </a>
        )}
        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "login.submit")}
        </button>
      </form>
      {activeSocial.length > 0 && (
        <>
          <div data-imbrace="divider">{t(lang, "login.or")}</div>
          {activeSocial.map((p) => (
            <a
              key={p.providerKey}
              data-imbrace="btn-social"
              href={`/${p.providerKey}/authorize`}
            >
              {p.icon && <span class="social-icon">{p.icon}</span>}
              <span>
                {t(lang, "common.continue_with")}{" "}
                {p.label.replace("Continue with ", "")}
              </span>
            </a>
          ))}
        </>
      )}
      <div data-imbrace="divider">{t(lang, "login.or")}</div>
      <a data-imbrace="btn-otp" href="?view=otp">
        {t(lang, "login.otp")}
      </a>
      {signUpUrl && (
        <div data-imbrace="hint">
          <span>{t(lang, "login.no_account")} </span>
          <a data-imbrace="hint-link" href={signUpUrl}>
            {t(lang, "login.signup")}
          </a>
        </div>
      )}
    </ImbraceLayout>
  )
}

// ---------------------------------------------------------------------------
// Forgot Password Flow Components
// ---------------------------------------------------------------------------

export function ImbraceForgotPasswordForm({
  error,
  signUpUrl,
  lang,
}: {
  error?: string
  signUpUrl?: string
  lang?: string
}) {
  return (
    <ImbraceLayout title={`${t(lang, "forgot.title")} – iMBrace`} lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "forgot.title")}</h1>
      {error && <div data-imbrace="error">{error}</div>}
      <form data-imbrace="form" method="post">
        <div data-imbrace="field">
          <label data-imbrace="label" for="email">
            {t(lang, "login.email")}
          </label>
          <input
            data-imbrace="input"
            id="email"
            type="email"
            name="email"
            required
            autofocus
            oninvalid={`this.setCustomValidity('${t(lang, "forgot.error.email")}')`}
            oninput={`this.setCustomValidity('')`}
          />
        </div>
        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "forgot.submit")}
        </button>
      </form>
      <div data-imbrace="divider">{t(lang, "login.or")}</div>
      <a data-imbrace="btn-otp" href="authorize?view=otp">
        {t(lang, "login.otp")}
      </a>
      {signUpUrl && (
        <div data-imbrace="hint">
          <span>{t(lang, "login.no_account")} </span>
          <a data-imbrace="hint-link" href={signUpUrl}>
            {t(lang, "login.signup")}
          </a>
        </div>
      )}
    </ImbraceLayout>
  )
}

export function ImbraceForgotPasswordSuccess({
  email,
  lang,
}: {
  email: string
  lang?: string
}) {
  const safeScript = `
    (function() {
      var emailValue = ${JSON.stringify(email)};
      var resend = document.getElementById('resend-link');

      if (resend) {
        var COOLDOWN = 60;
        var storageKey = 'imbrace_pr_resend_' + btoa(emailValue);
        
        function updateResendUI() {
          var lastResend = localStorage.getItem(storageKey);
          if (lastResend) {
            var diff = Math.floor((Date.now() - parseInt(lastResend)) / 1000);
            if (diff < COOLDOWN) {
              var remaining = COOLDOWN - diff;
              resend.style.pointerEvents = 'none';
              resend.style.color = '#156df2';
              resend.style.textDecoration = 'none';
              resend.innerText = remaining.toString();
              
              var timer = setTimeout(function() {
                updateResendUI();
              }, 1000);
              return true;
            }
          }
          resend.style.pointerEvents = 'auto';
          resend.style.color = '#156df2';
          resend.style.textDecoration = 'underline';
          resend.innerText = '${t(lang, "forgot.success.resend_link")}';
          return false;
        }

        updateResendUI();

        resend.addEventListener('click', function(e) {
          e.preventDefault();
          if (updateResendUI()) return;

          localStorage.setItem(storageKey, Date.now().toString());
          updateResendUI();

          var f = document.createElement('form');
          f.method = 'POST';
          var act = document.createElement('input');
          act.type = 'hidden'; act.name = 'email'; act.value = emailValue;
          f.appendChild(act);
          document.body.appendChild(f);
          f.submit();
        });
      }
    })();
  `
  return (
    <ImbraceLayout title="Check your email – iMBrace" lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <div data-imbrace="success-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="24" fill="#FFF7ED" />
          <path
            d="M14 22L16 20L34 20L36 22V32L34 34H16L14 32V22Z"
            stroke="#FA9917"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M14 22L25 28L36 22"
            stroke="#FA9917"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
      <h1
        data-imbrace="page-header"
        style={{ fontSize: "20px", fontWeight: 400 }}
      >
        {t(lang, "forgot.success.title")}{" "}
        <span
          class="email"
          style={{ fontWeight: 700, display: "block", marginTop: "4px" }}
        >
          {email}{" "}
          <a
            href="?view=forgot-password"
            style={{
              fontSize: "14px",
              marginLeft: "4px",
              color: "#156df2",
              textDecoration: "underline",
            }}
          >
            {t(lang, "otp.verify.change_email")}
          </a>
        </span>
      </h1>

      <p class="otp-resend" style={{ color: "#333333" }}>
        {t(lang, "forgot.success.resend_prompt")}{" "}
        <a href="#" id="resend-link">
          {t(lang, "forgot.success.resend_link")}
        </a>
      </p>

      <div data-imbrace="hint">
        <a data-imbrace="hint-link" href="authorize">
          {t(lang, "otp.request.back")}
        </a>
      </div>
      <script dangerouslySetInnerHTML={{ __html: safeScript }} />
    </ImbraceLayout>
  )
}

export function ImbraceResetPasswordForm({
  email,
  verifyCode,
  error,
  lang,
}: {
  email: string
  verifyCode: string
  error?: string
  lang?: string
}) {
  return (
    <ImbraceLayout title={`${t(lang, "reset.title")} – iMBrace`} lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "reset.title")}</h1>
      {error && <div data-imbrace="error">{error}</div>}
      <form data-imbrace="form" method="post">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="verify_code" value={verifyCode} />

        <div data-imbrace="field">
          <label data-imbrace="label" for="email-display">
            {t(lang, "login.email")}
          </label>
          <input
            data-imbrace="input"
            id="email-display"
            type="email"
            value={email}
            disabled
            style={{ backgroundColor: "#f9fafb", cursor: "not-allowed" }}
          />
        </div>

        <ImbracePasswordField
          id="password"
          label={t(lang, "reset.submit")}
          name="password"
          required
          autofocus
          showTooltip={false}
          lang={lang}
        />

        <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
          <ul
            data-imbrace="validation-list"
            id="password-requirements"
            style={{ paddingLeft: "1.25rem" }}
          >
            {[
              { id: "req-length", text: t(lang, "common.req.length") },
              {
                id: "req-lower",
                text: t(lang, "common.req.lower"),
              },
              {
                id: "req-upper",
                text: t(lang, "common.req.upper"),
              },
              { id: "req-number", text: t(lang, "common.req.number") },
              {
                id: "req-special",
                text: t(lang, "common.req.special"),
              },
            ].map((req) => (
              <li key={req.id} id={req.id}>
                <div class="li-content">
                  <span>{req.text}</span>
                  <span class="icon-checked" style={{ display: "none" }}>
                    <IconCheckCircle color="var(--imbrace-primary)" />
                  </span>
                  <span class="icon-unchecked">
                    <IconCheckCircle color="#d1d5db" />
                  </span>
                  <span class="icon-error" style={{ display: "none" }}>
                    <IconHighlightOff color="var(--imbrace-error-text)" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "reset.submit")}
        </button>
      </form>
      <script
        dangerouslySetInnerHTML={{
          __html: `
        (function() {
          var input = document.getElementById('password');
          var reqs = {
            'req-length': function(v) { return v.length >= 12; },
            'req-lower': function(v) { return /[a-z]/.test(v); },
            'req-upper': function(v) { return /[A-Z]/.test(v); },
            'req-number': function(v) { return /[0-9]/.test(v); },
            'req-special': function(v) { return /[!@#$%^&*_()+\\-=\\[\\]{}|]/.test(v); }
          };

          function updateUI() {
            var v = input.value;
            Object.keys(reqs).forEach(function(id) {
              var el = document.getElementById(id);
              var isOk = reqs[id](v);
              if (el) {
                el.className = isOk ? 'req-valid' : (v ? 'req-invalid' : '');
                var iconChecked = el.querySelector('.icon-checked');
                var iconUnchecked = el.querySelector('.icon-unchecked');
                var iconError = el.querySelector('.icon-error');
                
                if (iconChecked) iconChecked.style.display = isOk ? 'inline-block' : 'none';
                if (iconUnchecked) iconUnchecked.style.display = (!isOk && !v) ? 'inline-block' : 'none';
                if (iconError) iconError.style.display = (!isOk && v) ? 'inline-block' : 'none';
              }
            });
          }

          if (input) {
            input.addEventListener('input', updateUI);
            updateUI();
          }
        })();
      `,
        }}
      />
    </ImbraceLayout>
  )
}

export function ImbraceResetPasswordSuccess({ lang }: { lang?: string }) {
  return (
    <ImbraceLayout
      title={`${t(lang, "reset.success.title")} – iMBrace`}
      lang={lang}
    >
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <div data-imbrace="success-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="24" fill="#F0FDF4" />
          <path
            d="M18 24L22 28L30 20"
            stroke="#16A34A"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1 data-imbrace="page-header">{t(lang, "reset.success.title")}</h1>
      <p data-imbrace="message">{t(lang, "reset.success.message")}</p>
      <a data-imbrace="btn-link" href="authorize">
        {t(lang, "signup.signin")}
      </a>
    </ImbraceLayout>
  )
}

// ---------------------------------------------------------------------------
// OTP Components
// ---------------------------------------------------------------------------

export function ImbraceOtpEmailForm({
  error,
  lang,
}: {
  error?: string
  lang?: string
}) {
  return (
    <ImbraceLayout lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "otp.request.title")}</h1>
      {error && <div data-imbrace="error">{error}</div>}
      <form data-imbrace="form" method="post">
        <input type="hidden" name="action" value="request" />
        <div data-imbrace="field">
          <input
            data-imbrace="input"
            id="email"
            type="email"
            name="email"
            required
            autofocus
            placeholder={t(lang, "login.email")}
          />
        </div>
        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "otp.request.submit")}
        </button>
      </form>
      <div data-imbrace="hint">
        <a data-imbrace="hint-link" href="authorize">
          {t(lang, "otp.request.back")}
        </a>
      </div>
    </ImbraceLayout>
  )
}

export function ImbraceOtpVerifyForm({
  email,
  error,
  lang,
}: {
  email: string
  error?: string
  lang?: string
}) {
  const safeScript = `
    (function() {
      var emailValue = ${JSON.stringify(email)};
      var inputs = document.querySelectorAll('.otp-digits input');
      var hidden = document.getElementById('otp-hidden');
      var form = document.getElementById('otp-form');
      var resend = document.getElementById('resend-link');

      inputs.forEach(function(inp, i) {
        inp.addEventListener('input', function(e) {
          var val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 1);
          e.target.value = val;
          if (val && i < inputs.length - 1) inputs[i + 1].focus();
          syncAndSubmit();
        });
        inp.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace' && !e.target.value && i > 0) inputs[i - 1].focus();
        });
      });

      function syncAndSubmit() {
        var code = Array.from(inputs).map(function(i) { return i.value; }).join('');
        hidden.value = code;
        if (code.length === 6) form.submit();
      }

      if (resend) {
        var COOLDOWN = 60;
        var storageKey = 'imbrace_otp_resend_' + btoa(emailValue);
        
        function updateResendUI() {
          var lastResend = localStorage.getItem(storageKey);
          if (lastResend) {
            var diff = Math.floor((Date.now() - parseInt(lastResend)) / 1000);
            if (diff < COOLDOWN) {
              var remaining = COOLDOWN - diff;
              resend.style.pointerEvents = 'none';
              resend.style.color = '#156df2'; /* Keep original color */
              resend.style.textDecoration = 'none';
              resend.innerText = remaining.toString(); /* Just the number */
              
              var timer = setTimeout(function() {
                updateResendUI();
              }, 1000);
              return true;
            }
          }
          resend.style.pointerEvents = 'auto';
          resend.style.color = '#156df2';
          resend.style.textDecoration = 'underline';
          resend.innerText = '${t(lang, "otp.verify.resend_link")}';
          return false;
        }

        updateResendUI();

        resend.addEventListener('click', function(e) {
          e.preventDefault();
          if (updateResendUI()) return;

          localStorage.setItem(storageKey, Date.now().toString());
          updateResendUI();

          var f = document.createElement('form');
          f.method = 'POST';
          var act = document.createElement('input');
          act.type = 'hidden'; act.name = 'action'; act.value = 'request';
          f.appendChild(act);
          var em = document.createElement('input');
          em.type = 'hidden'; em.name = 'email'; em.value = emailValue;
          f.appendChild(em);
          document.body.appendChild(f);
          f.submit();
        });
      }
    })();
  `
  return (
    <ImbraceLayout lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <div class="otp-page">
        {error && <div class="otp-error">{error}</div>}
        <h1
          data-imbrace="page-header"
          style={{ fontSize: "20px", fontWeight: 400 }}
        >
          {t(lang, "otp.verify.subtitle")}{" "}
          <span
            class="email"
            style={{ fontWeight: 700, display: "block", marginTop: "4px" }}
          >
            {email}{" "}
            <a
              href="?view=otp"
              style={{
                fontSize: "14px",
                marginLeft: "4px",
                color: "#156df2",
                textDecoration: "underline",
              }}
            >
              {t(lang, "otp.verify.change_email")}
            </a>
          </span>
        </h1>
        <form data-imbrace="form" method="post" id="otp-form">
          <input type="hidden" name="action" value="verify" />
          <input type="hidden" name="otp" id="otp-hidden" />
          <div class="otp-digits">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                autocomplete="off"
                autofocus={idx === 0}
              />
            ))}
          </div>
        </form>
        <p class="otp-resend">{t(lang, "otp.verify.resend_prompt")}</p>
        <p class="otp-resend">
          <a href="#" id="resend-link">
            {t(lang, "otp.verify.resend_link")}
          </a>
        </p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: safeScript }} />
    </ImbraceLayout>
  )
}

// ---------------------------------------------------------------------------
// Signup Flow Components
// ---------------------------------------------------------------------------

function ImbraceStepper({
  activeStep,
  lang,
}: {
  activeStep: number
  lang?: string
}) {
  return (
    <div data-imbrace="stepper">
      <div data-imbrace="step" data-active={activeStep >= 0}>
        <div class="step-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="20" height="20" rx="4" fill="currentColor" />
            <path
              d="M7 10L9 12L13 8"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <span class="step-label">{t(lang, "signup.submit")}</span>
      </div>
      <div class="step-connector">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 12L10 8L6 4"
            stroke="#D1D5DB"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div data-imbrace="step" data-active={activeStep >= 1}>
        <div class="step-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="20" height="20" rx="4" fill="currentColor" />
            <text
              x="50%"
              y="50%"
              dominant-baseline="central"
              text-anchor="middle"
              fill="white"
              font-size="12"
              font-weight="bold"
            >
              2
            </text>
          </svg>
        </div>
        <span class="step-label">{t(lang, "verify.title")}</span>
      </div>
    </div>
  )
}

export function ImbraceSignupForm({
  email,
  error,
  lang,
}: {
  email?: string
  error?: string
  lang?: string
}) {
  const validationScript = `
    (function() {
      var input = document.getElementById('password');
      var form = document.getElementById('signup-form');
      var btn = form.querySelector('button[type="submit"]');

      var reqs = {
        'req-length': function(v) { return v.length >= 12; },
        'req-lower': function(v) { return /[a-z]/.test(v); },
        'req-upper': function(v) { return /[A-Z]/.test(v); },
        'req-number': function(v) { return /[0-9]/.test(v); },
        'req-special': function(v) { return /[!@#$%^&*_()+\\-=\\[\\]{}|]/.test(v); }
      };

      function updateUI() {
        var v = input.value;
        var allOk = true;
        Object.keys(reqs).forEach(function(id) {
          var el = document.getElementById(id);
          var isOk = reqs[id](v);
          if (!isOk) allOk = false;
          if (el) {
            el.className = isOk ? 'req-valid' : (v ? 'req-invalid' : '');
            var iconChecked = el.querySelector('.icon-checked');
            var iconUnchecked = el.querySelector('.icon-unchecked');
            var iconError = el.querySelector('.icon-error');
            
            if (iconChecked) iconChecked.style.display = isOk ? 'inline-block' : 'none';
            if (iconUnchecked) iconUnchecked.style.display = (!isOk && !v) ? 'inline-block' : 'none';
            if (iconError) iconError.style.display = (!isOk && v) ? 'inline-block' : 'none';
          }
        });
        // btn.disabled = !allOk;
      }

      if (input) {
        input.addEventListener('input', updateUI);
        updateUI();
      }
    })();
  `

  return (
    <ImbraceLayout title="Signup for free – iMBrace" lang={lang}>
      <ImbraceStepper activeStep={0} lang={lang} />
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "signup.title")}</h1>
      {error && <div data-imbrace="error">{error}</div>}
      <form data-imbrace="form" method="post" id="signup-form">
        <input type="hidden" name="action" value="signup" />
        <div data-imbrace="field">
          <label data-imbrace="label" for="email">
            {t(lang, "login.email")}
          </label>
          <input
            data-imbrace="input"
            id="email"
            type="email"
            name="email"
            required
            autoFocus={!email}
            value={email}
            placeholder={t(lang, "login.email")}
          />
        </div>
        <ImbracePasswordField
          id="password"
          label={t(lang, "login.password")}
          name="password"
          required
          placeholder={t(lang, "login.password")}
          showTooltip={false}
          lang={lang}
        />

        <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
          <ul data-imbrace="validation-list" id="password-requirements">
            {[
              { id: "req-length", text: t(lang, "common.req.length") },
              { id: "req-lower", text: t(lang, "common.req.lower") },
              { id: "req-upper", text: t(lang, "common.req.upper") },
              { id: "req-number", text: t(lang, "common.req.number") },
              {
                id: "req-special",
                text: t(lang, "common.req.special"),
              },
            ].map((req) => (
              <li key={req.id} id={req.id}>
                <div class="li-content">
                  <span>{req.text}</span>
                  <span class="icon-checked" style={{ display: "none" }}>
                    <IconCheckCircle color="var(--imbrace-primary)" />
                  </span>
                  <span class="icon-unchecked">
                    <IconCheckCircle color="#d1d5db" />
                  </span>
                  <span class="icon-error" style={{ display: "none" }}>
                    <IconHighlightOff color="var(--imbrace-error-text)" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "signup.submit")}
        </button>
      </form>
      <div data-imbrace="hint">
        <span>{t(lang, "signup.already_have")} </span>
        <a data-imbrace="hint-link" href="authorize">
          {t(lang, "signup.signin")}
        </a>
      </div>
      <script dangerouslySetInnerHTML={{ __html: validationScript }} />
    </ImbraceLayout>
  )
}

export function ImbraceVerifyEmailForm({
  email,
  error,
  lang,
}: {
  email: string
  error?: string
  lang?: string
}) {
  return (
    <ImbraceLayout title={`${t(lang, "verify.title")} – iMBrace`} lang={lang}>
      <ImbraceStepper activeStep={1} lang={lang} />
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header" style={{ marginBottom: "1rem" }}>
        {t(lang, "verify.title")}
      </h1>
      <p data-imbrace="message">
        {t(lang, "verify.subtitle")} <strong>{email}</strong>
      </p>

      {error && (
        <div data-imbrace="error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form data-imbrace="form" method="post">
        <input type="hidden" name="action" value="verify_email" />
        <input type="hidden" name="email" value={email} />
        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "common.loading").replace("...", "")}
        </button>
      </form>

      <div data-imbrace="hint">
        <span>{t(lang, "verify.resend_prompt")} </span>
        <button
          data-imbrace="hint-link"
          onclick={`(function() {
            var f = document.createElement('form');
            f.method = 'POST';
            var a = document.createElement('input');
            a.type = 'hidden'; a.name = 'action'; a.value = 'resend_verification';
            var e = document.createElement('input');
            e.type = 'hidden'; e.name = 'email'; e.value = ${JSON.stringify(email)};
            f.appendChild(a); f.appendChild(e);
            document.body.appendChild(f);
            f.submit();
          })()`}
        >
          {t(lang, "verify.resend_link")}
        </button>
      </div>

      <div data-imbrace="hint" style={{ marginTop: "0.5rem" }}>
        <a data-imbrace="hint-link" href="authorize">
          {t(lang, "otp.request.back")}
        </a>
      </div>
    </ImbraceLayout>
  )
}

// ---------------------------------------------------------------------------
// Setup Owner Form (first-time deploy — community mode)
// ---------------------------------------------------------------------------

export function ImbraceSetupOwnerForm({
  error,
  lang,
}: {
  error?: string
  lang?: string
}) {
  return (
    <ImbraceLayout title={`${t(lang, "setup.title")} – iMBrace`} lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "setup.title")}</h1>
      <p data-imbrace="message">{t(lang, "setup.subtitle")}</p>
      {error && <div data-imbrace="error">{error}</div>}
      <form data-imbrace="form" method="post">
        <input type="hidden" name="action" value="setup_owner" />
        <div data-imbrace="field">
          <label data-imbrace="label" for="email">
            {t(lang, "setup.email")}
          </label>
          <input
            data-imbrace="input"
            id="email"
            type="email"
            name="email"
            required
            autofocus
          />
        </div>
        <ImbracePasswordField
          id="password"
          label={t(lang, "setup.password")}
          name="password"
          required
          lang={lang}
        />
        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "setup.submit")}
        </button>
      </form>
    </ImbraceLayout>
  )
}

export function ImbraceSetupOwnerSuccess({ lang }: { lang?: string }) {
  return (
    <ImbraceLayout
      title={`${t(lang, "setup.success.title")} – iMBrace`}
      lang={lang}
    >
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <div data-imbrace="success-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="24" fill="#F0FDF4" />
          <path
            d="M18 24L22 28L30 20"
            stroke="#16A34A"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1 data-imbrace="page-header">{t(lang, "setup.success.title")}</h1>
      <p data-imbrace="message">{t(lang, "setup.success.message")}</p>
      <a data-imbrace="btn-link" id="signin-link" href="/authorize">
        {t(lang, "signup.signin")}
      </a>
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var a = document.getElementById('signin-link');
          if (a) {
            var cb = encodeURIComponent(location.origin + '/admin/callback?next=' + encodeURIComponent('/admin/members'));
            a.href = '/authorize?client_id=admin&response_type=code&redirect_uri=' + cb;
          }
        })();
      `}} />
    </ImbraceLayout>
  )
}

// ---------------------------------------------------------------------------
// Admin Panel (member management — community mode, owner only)
// ---------------------------------------------------------------------------

export interface AdminMember {
  id: string
  email: string
  role: string
  status: string
  created_at: string
}

export function ImbraceAdminPanel({
  members,
  currentUserId,
  error,
  success,
  lang,
}: {
  members: AdminMember[]
  currentUserId: string
  error?: string
  success?: string
  lang?: string
}) {
  return (
    <ImbraceLayout title={`${t(lang, "admin.title")} – iMBrace`} lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "admin.title")}</h1>
      {error && <div data-imbrace="error">{error}</div>}
      {success && <div data-imbrace="success">{success}</div>}
      <div style={{ marginBottom: "1.5rem", textAlign: "right" }}>
        <a data-imbrace="btn-primary" href="/admin/invite" style={{ display: "inline-block", padding: "0.5rem 1.25rem", fontSize: "14px", textDecoration: "none" }}>
          + {t(lang, "admin.invite")}
        </a>
      </div>
      {members.length === 0 ? (
        <p data-imbrace="message">{t(lang, "admin.no_members")}</p>
      ) : (
        <table data-imbrace="table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>{t(lang, "admin.email")}</th>
              <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>{t(lang, "admin.role")}</th>
              <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>{t(lang, "admin.status")}</th>
              <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>{t(lang, "admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.75rem 0.5rem" }}>{m.email}</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: m.role === "owner" ? "#FEF3C7" : "#DBEAFE",
                    color: m.role === "owner" ? "#92400E" : "#1E40AF",
                  }}>
                    {t(lang, m.role === "owner" ? "admin.role.owner" : "admin.role.member")}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: m.status === "active" ? "#D1FAE5" : "#FEE2E2",
                    color: m.status === "active" ? "#065F46" : "#991B1B",
                  }}>
                    {t(lang, m.status === "active" ? "admin.status.active" : "admin.status.pending")}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  {m.id !== currentUserId && m.status === "active" && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <form method="post" action="/admin/members" style={{ display: "inline" }}>
                        <input type="hidden" name="action" value="change_role" />
                        <input type="hidden" name="userId" value={m.id} />
                        <input type="hidden" name="role" value={m.role === "owner" ? "member" : "owner"} />
                        <button
                          type="submit"
                          style={{
                            background: "none",
                            border: "1px solid #D1D5DB",
                            borderRadius: "6px",
                            padding: "0.25rem 0.625rem",
                            fontSize: "12px",
                            cursor: "pointer",
                            color: "#374151",
                          }}
                        >
                          {m.role === "owner"
                            ? `→ ${t(lang, "admin.role.member")}`
                            : `→ ${t(lang, "admin.role.owner")}`}
                        </button>
                      </form>
                      <form method="post" action="/admin/members" style={{ display: "inline" }}
                        onsubmit={`return confirm('${t(lang, "admin.remove_confirm")}')`}>
                        <input type="hidden" name="action" value="remove" />
                        <input type="hidden" name="userId" value={m.id} />
                        <button
                          type="submit"
                          style={{
                            background: "none",
                            border: "1px solid #FCA5A5",
                            borderRadius: "6px",
                            padding: "0.25rem 0.625rem",
                            fontSize: "12px",
                            cursor: "pointer",
                            color: "#DC2626",
                          }}
                        >
                          {t(lang, "admin.remove")}
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div data-imbrace="hint" style={{ marginTop: "1.5rem" }}>
        <a data-imbrace="hint-link" id="admin-back-link" href="/">
          {t(lang, "admin.back")}
        </a>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var a = document.getElementById('admin-back-link');
          if (a) {
            var cb = encodeURIComponent(location.origin + '/admin/callback?next=' + encodeURIComponent('/'));
            a.href = '/authorize?client_id=admin&response_type=code&redirect_uri=' + cb;
          }
        })();
      `}} />
    </ImbraceLayout>
  )
}

// ---------------------------------------------------------------------------
// Invite Form (owner invites new member — community mode)
// ---------------------------------------------------------------------------

export function ImbraceInviteForm({
  error,
  lang,
}: {
  error?: string
  lang?: string
}) {
  return (
    <ImbraceLayout title={`${t(lang, "invite.title")} – iMBrace`} lang={lang}>
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "invite.title")}</h1>
      {error && <div data-imbrace="error">{error}</div>}
      <form data-imbrace="form" method="post">
        <div data-imbrace="field">
          <label data-imbrace="label" for="email">
            {t(lang, "invite.email")}
          </label>
          <input
            data-imbrace="input"
            id="email"
            type="email"
            name="email"
            required
            autofocus
          />
        </div>
        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "invite.submit")}
        </button>
      </form>
      <div data-imbrace="hint">
        <a data-imbrace="hint-link" href="/admin/members">
          {t(lang, "invite.back")}
        </a>
      </div>
    </ImbraceLayout>
  )
}

export function ImbraceInviteSuccess({
  inviteLink,
  lang,
  emailSent,
  emailTo,
}: {
  inviteLink: string
  lang?: string
  emailSent?: boolean
  emailTo?: string
}) {
  const copyScript = `
    (function() {
      var btn = document.getElementById('copy-btn');
      var ta = document.getElementById('invite-link');
      if (btn && ta) {
        btn.addEventListener('click', function() {
          ta.select();
          navigator.clipboard.writeText(ta.value).catch(function() {
            document.execCommand('copy');
          });
          btn.innerText = '${t(lang, "invite.success.copied")}';
          setTimeout(function() {
            btn.innerText = '${t(lang, "invite.success.copy")}';
          }, 2000);
        });
      }
    })();
  `
  const message = emailSent && emailTo
    ? t(lang, "invite.success.email_sent").replace("{email}", emailTo)
    : t(lang, "invite.success.message")
  return (
    <ImbraceLayout
      title={`${t(lang, "invite.success.title")} – iMBrace`}
      lang={lang}
    >
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <div data-imbrace="success-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="24" fill="#F0FDF4" />
          <path
            d="M18 24L22 28L30 20"
            stroke="#16A34A"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1 data-imbrace="page-header">{t(lang, "invite.success.title")}</h1>
      <p data-imbrace="message">{message}</p>
      <div style={{ marginBottom: "1.5rem" }}>
        <textarea
          id="invite-link"
          readonly
          rows={3}
          onclick="this.select()"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "0.625rem 0.75rem",
            fontSize: "13px",
            lineHeight: "1.5",
            fontFamily: "monospace",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            resize: "none",
            color: "#374151",
            wordBreak: "break-all",
            overflowWrap: "break-word",
            marginBottom: "0.5rem",
          }}
          dangerouslySetInnerHTML={{ __html: inviteLink.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }}
        />
        <button
          id="copy-btn"
          data-imbrace="btn-primary"
          type="button"
          style={{ width: "100%" }}
        >
          {t(lang, "invite.success.copy")}
        </button>
      </div>
      <div data-imbrace="hint">
        <a data-imbrace="hint-link" href="/admin/members">
          {t(lang, "invite.back")}
        </a>
      </div>
      <script dangerouslySetInnerHTML={{ __html: copyScript }} />
    </ImbraceLayout>
  )
}

// ---------------------------------------------------------------------------
// Invite Activation (invited user sets password)
// ---------------------------------------------------------------------------

export function ImbraceInviteActivateForm({
  token,
  error,
  lang,
}: {
  token: string
  error?: string
  lang?: string
}) {
  return (
    <ImbraceLayout
      title={`${t(lang, "invite.activate.title")} – iMBrace`}
      lang={lang}
    >
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <h1 data-imbrace="page-header">{t(lang, "invite.activate.title")}</h1>
      <p data-imbrace="message">{t(lang, "invite.activate.subtitle")}</p>
      {error && <div data-imbrace="error">{error}</div>}
      <form data-imbrace="form" method="post">
        <input type="hidden" name="token" value={token} />
        <ImbracePasswordField
          id="password"
          label={t(lang, "invite.activate.password")}
          name="password"
          required
          autofocus
          lang={lang}
        />
        <button data-imbrace="btn-primary" type="submit">
          {t(lang, "invite.activate.submit")}
        </button>
      </form>
    </ImbraceLayout>
  )
}

export function ImbraceInviteActivateSuccess({ lang }: { lang?: string }) {
  return (
    <ImbraceLayout
      title={`${t(lang, "invite.activate.success.title")} – iMBrace`}
      lang={lang}
    >
      <div data-imbrace="logo">
        <ImbraceLogo />
      </div>
      <div data-imbrace="success-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="24" fill="#F0FDF4" />
          <path
            d="M18 24L22 28L30 20"
            stroke="#16A34A"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1 data-imbrace="page-header">
        {t(lang, "invite.activate.success.title")}
      </h1>
      <p data-imbrace="message">
        {t(lang, "invite.activate.success.message")}
      </p>
      <a data-imbrace="btn-link" id="activate-signin-btn" href="/authorize">
        {t(lang, "signup.signin")}
      </a>
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var a = document.getElementById('activate-signin-btn');
          if (a) {
            var ru = encodeURIComponent(location.origin);
            a.href = '/authorize?client_id=web&response_type=code&redirect_uri=' + ru;
          }
        })();
      `}} />
    </ImbraceLayout>
  )
}

// ---------------------------------------------------------------------------
// Imbrace Password UI Factory
// ---------------------------------------------------------------------------

export interface ImbracePasswordUIOptions
  extends Pick<PasswordConfig, "sendCode" | "validatePassword"> {
  social?: SocialProviderButton[]
  signUpUrl?: string
}

export function ImbracePasswordUI(
  options: ImbracePasswordUIOptions,
): PasswordConfig {
  const { sendCode, validatePassword, social = [], signUpUrl } = options
  return {
    sendCode,
    validatePassword,
    login: async (_req, form, error) => {
      const msg = error ? "Invalid email or password." : undefined
      const jsx = (
        <ImbraceLoginForm
          social={social}
          error={msg}
          forgotPasswordUrl="change"
          signUpUrl={signUpUrl}
        />
      )
      return new Response(jsx.toString(), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      })
    },
    register: async (_req, state, form, error) => {
      let jsx: any
      if (state.type === "start") {
        jsx = (
          <ImbraceSignupForm
            error={error ? "Invalid input." : undefined}
            email={form?.get("email")?.toString()}
          />
        )
      } else {
        jsx = (
          <ImbraceVerifyEmailForm
            email={state.email}
            error={error ? "Invalid code." : undefined}
          />
        )
      }
      return new Response(jsx.toString(), {
        headers: { "Content-Type": "text/html" },
      })
    },
    change: async (_req, state, form, error) => {
      let jsx: any
      if (state.type === "start") {
        jsx = (
          <ImbraceForgotPasswordForm
            error={error ? "Invalid email." : undefined}
            signUpUrl={signUpUrl}
          />
        )
      } else if (state.type === "code") {
        jsx = (
          <ImbraceOtpVerifyForm
            email={state.email}
            error={error ? "Invalid code." : undefined}
          />
        )
      } else if (state.type === "update") {
        jsx = (
          <ImbraceResetPasswordForm
            email={state.email}
            verifyCode=""
            error={error ? "Passwords mismatch." : undefined}
          />
        )
      }
      return new Response(jsx.toString(), {
        headers: { "Content-Type": "text/html" },
      })
    },
  }
}
