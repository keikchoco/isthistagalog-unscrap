# Unscrap: Transforming Kitchen Waste into Wealth through AI and Gamification

## 1. Introduction
The modern consumer landscape is often characterized by a linear "make-use-dispose" model. In the context of the domestic kitchen, organic byproducts—often termed "waste"—possess latent value that remains largely untapped due to a lack of specialized knowledge among the general populace. **Unscrap** is an interventionist digital tool designed to disrupt this linear flow by providing immediate, AI-driven education and incentive for waste repurposing.

## 2. Theoretical Framework
Unscrap operates at the intersection of three core domains:
1. **Computer Vision (CV)**: Automating the identification of organic materials.
2. **Behavioral Economics**: Using gamification to incentivize ecological choices.
3. **Circular Economy**: Promoting the "loops" of resource reuse within the household.

## 3. System Architecture
The application architecture is designed for low-latency feedback and high-fidelity data visualization.

### 3.1 AI Inference Layer
The engine of Unscrap is the **Gemini-2.5-Pro-Preview** model. Unlike traditional classification models, Gemini allows for multi-modal reasoning. It doesn't just name an object; it assesses its "texture safety," estimates its mass, and calculates its potential carbon-sequestration value if composted or regrown.

### 3.2 Data Management
Using **Google Cloud Firestore**, the system maintains a "World State" of sustainability. Every user's "transmutation" (the act of logging a repurposed item) is recorded, contributing to a global impact score. This real-time synchronization is critical for the Community Map feature, which visualizes the collective effort of the user base.

## 4. The 3R Lab Gamification
The "3R Lab System" is the primary retention mechanic of Unscrap. By framing waste management as the 3R Lab—the art of turning waste into wonder—the app transforms a chore into a rewarding game. 
- **XP (Experience Points)**: Distributed based on the rarity and difficulty of the repurposing task.
- **Financial Estimators**: By showing users the potential money saved (e.g., "This fertilizer from eggshells saved you ₱45.00"), the app appeals to pragmatic motivations alongside altruistic ones.

## 5. Security and Scalability
A significant portion of the development cycle was dedicated to **Firestore Security Rule Hardening**. We implemented a "Tiered Identity" logic ensuring that while a user's progress can be publicly shared for competitive leaderboards, their private interaction history remains securely isolated behind authenticated UID guards.

## 6. Conclusion
Unscrap demonstrates that the "black box" of AI can be opened for profound social good. By making sustainability effortless and entertaining, we provide a pathway for the average consumer to become an active participant in the global effort to mitigate climate change, one kitchen scrap at a time.
