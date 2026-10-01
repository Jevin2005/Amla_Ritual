# Judge.me Review System Setup Guide

This guide walks you through setting up **Judge.me Product Reviews** on your Shopify store and connecting it to your headless Next.js storefront.

This gives your customers the ability to submit:
- **Written Text Reviews** (1–5 stars + title + comments)
- **Photo Uploads** (hair/scalp transformation photos)
- **Video Reviews** (recorded or uploaded customer videos)
- **Verified Buyer Badges** (automatically verified against Shopify orders)

All of this is **100% controlled inside Shopify Admin**, runs on the **Forever Free Plan ($0/mo)**, and requires **no custom database or backend** on your Next.js application.

---

## Step 1: Install Judge.me on Shopify

1. Log into your **Shopify Admin** (`amla-ritual.myshopify.com/admin`).
2. Go to the **Shopify App Store** or visit [apps.shopify.com/judgeme](https://apps.shopify.com/judgeme).
3. Click **Install**.
4. Choose the **Forever Free** plan ($0/month). It includes:
   - Unlimited review requests
   - Text, photo, and video reviews
   - Review moderation dashboard
   - SEO rich snippets

---

## Step 2: Enable Photo and Video Reviews

1. In Shopify Admin, navigate to **Apps** > **Judge.me Product Reviews**.
2. Go to **Settings** > **Review Widget** > **Review Form**.
3. Under **Media uploads**:
   - Check **Allow photo reviews**.
   - Check **Allow video reviews**.
4. (Optional) Customize the review form labels (e.g., *"Share your hair ritual results"*).
5. Click **Save Settings**.

---

## Step 3: Get Your Public API Token

To allow your headless storefront to securely fetch your reviews without revealing private keys:

1. In Judge.me Admin, go to **Settings** > **Integrations** > **Developers**.
2. Click **View API Tokens**.
3. Copy the **Public API Token**.
4. In your project, open `frontend/.env.local` and add:
   ```env
   NEXT_PUBLIC_ENABLE_JUDGEME=true
   NEXT_PUBLIC_JUDGEME_SHOP_DOMAIN=amla-ritual.myshopify.com
   NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN=paste_your_public_token_here
   ```
5. Deploy or restart your frontend dev server.

---

## Step 4: Configure Automated Review Request Emails

Judge.me automatically sends review request emails to customers after their order is fulfilled:

1. In Judge.me Admin, go to **Emails** > **Review Requests**.
2. Set the status to **Active**.
3. Set the **Request Timing**:
   - Recommended: **7 to 14 days after fulfillment**. This gives customers enough time to receive the package and experience the Amla ritual mask before reviewing.
4. Customize the email template with your brand tone (e.g., *"How is your Amla ritual going?"*).
5. Customers can click the link in their email to rate, type comments, and upload pictures or videos directly from their smartphone.

---

## Step 5: Moderate & Manage Reviews in Shopify

You have complete control over every published review:

1. In Shopify Admin, open **Judge.me** > **Reviews**.
2. Review new customer submissions:
   - **Publish**: Makes the review visible on the product page.
   - **Hide / Reject**: Hides spam or inappropriate submissions.
   - **Pin / Feature**: Highlights top customer stories at the top.
   - **Reply**: Post a public merchant response thanking the customer.
3. Every order placed through your checkout is automatically tagged with the green **Verified Buyer** badge.

---

## Step 6: How It Works on Your Storefront

Your storefront uses a **hybrid design**:

1. **Curated Video Stories**: High-production editorial video reels managed in Shopify Metaobjects continue to display in the custom modal player above the reviews.
2. **Interactive Judge.me Widget**: 
   - Customers see the star rating and verified buyer reviews.
   - Customers can click **"Write a Review"** to rate, write text, and attach photo/video files.
   - Styled automatically with NatureMist's botanical palette (`--forest`, `--botanical`, `--amla`, `--paper`).
