# EIM Team Schedule Overview 📅

### Core Purpose
This is a centralized internal coordination tool for **EIM Technology**. It provides a real-time, visual overview of team shifts, availability, and project assignments to streamline collaboration across different time zones and departments.

---


## 🔗 Live Access

- **Production URL**: [teamschedule.eimtechnology.com](https://teamschedule.eimtechnology.com/)
- **Deployment Platform**: [Vercel](https://vercel.com/)
- **DNS Provider**: [Cloudflare](https://www.cloudflare.com/)

---

## 🛠 Technical Stack

- **Framework**: Next.js / React (Vibe Coding Philosophy)
- **Styling**: Tailwind CSS (Optimized for EIM Brand Identity)
- **Icons**: Lucide React
- **Infrastructure**: Vercel Edge Network

---


## 🌐 Domain & DNS Configuration (Cloudflare)

When migrating or updating the subdomain, ensure the following settings are applied in your Cloudflare dashboard:


### DNS Record
- **Type**: `CNAME`
- **Name**: `teamschedule`
- **Target**: `cname.vercel-dns.com`
- **Proxy Status**: 💡 **DNS Only (Gray Cloud)**
  > *Note: Keep Proxy "Off" during initial SSL handshake on Vercel. You can enable the Orange Cloud once the domain is verified.*


### SSL/TLS Encryption
- **Mode**: **Full** or **Full (Strict)**
  > *Warning: Setting this to "Flexible" will cause a "Too many redirects" error because Vercel enforces HTTPS.*

---

## 🎨 Branding & Favicon Customization

To maintain the EIM visual standard, insert the following code into the `<head>` section of your `index.html` (under the `<title>` tag):

### 🔹 Option A: EIM Standard Icon (Dark Blue)
```html
<link rel="icon" href="[https://github.com/Terback/Images/blob/main/logo/icon_darkblue.png?raw=true](https://github.com/Terback/Images/blob/main/logo/icon_darkblue.png?raw=true)" />
