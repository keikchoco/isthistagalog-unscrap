# Unscrap: Project Summary

## Overview
Unscrap is an AI-powered smart repurposing platform designed to transform domestic kitchen waste into valuable resources through a gamified experience called **The 3R Lab**. By leveraging Google's Gemini AI, the application identifies organic waste through computer vision and provides actionable instructions for composting, natural fertilization, and DIY domestic utility.

## Key Features Implemented

### 1. The 3R Lab Scanner
- **Gemini-Powered Analysis**: Integrates the `gemini-2.5-pro-preview-05-06` model for real-time image analysis.
- **Structured AI Insights**: The AI provides structured data including object identification with coordinates, "Texture Checks" for safety, and 3-5 repurposing suggestions.
- **Impact Metrics**: Tracking of CO2 diverted (grams) and monetary savings (₱) based on analyzed waste.

### 2. Gamified Sustainability
- **Ranks**: Users progress through tiers: Reducer, Reuser, Recycler, Restorer, and Zero Waste.
- **Rarity System**: Discovered items are assigned rarity grades: Everyday, Reusable, Recyclable, Rare Resource, and Raw.
- **The Bin**: A personal index of all discovered materials, categorized by rarity.

### 3. Community & Scrappy AI
- **Scrap-Map**: Google Maps integration for locating community composting hubs and sharing resource pins.
- **Scrappy AI Companion**: A conversational assistant specialized in waste reduction, reuse, and recycling advice.

### 4. Technical Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons.
- **Backend/State**: Firebase (Auth, Firestore).
- **AI/ML**: Google Generative AI (Gemini Pro).
- **Maps**: Google Maps Platform.
- **Animations**: Motion for fluid UI transitions.

## Vision Alignment
Unscrap directly addresses SDG 12 (Responsible Consumption), SDG 13 (Climate Action), and SDG 11 (Sustainable Cities) by empowering households to take control of their organic waste footprint through an engaging and rewarding digital interface.
