# NLP-Based Crisis Management and Product Recall Decision Support System

## Overview

The **NLP-Based Crisis Management and Product Recall Decision Support System** is an AI-assisted prototype designed to analyse customer feedback and identify potential product-harm indicators. It aims to support early risk identification and help organisations prioritise feedback that may require further investigation.

The system applies Natural Language Processing (NLP) techniques and rule-based text analysis to extract meaningful signals from customer feedback and organise them into actionable risk indicators.

## Key Features

- **Sentiment Analysis:** Classifies customer feedback as positive or negative.
- **Defect Detection:** Identifies potential product defects mentioned in feedback.
- **Safety Risk Assessment:** Categorises feedback into risk levels based on detected indicators.
- **Component Identification:** Maps feedback to potentially affected product components.
- **Crisis Risk Prioritisation:** Combines detected indicators to support the prioritisation of potentially harmful product issues.
- **Feedback Analysis:** Supports analysis of individual feedback entries and bulk datasets, where implemented.

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Database / Backend Services:** Supabase
- **Text Analysis:** Natural Language Processing and rule-based classification

## How It Works

1. **Input:** Customer feedback is provided for analysis.
2. **Text Processing:** Feedback is processed to identify relevant words and phrases.
3. **Sentiment Classification:** The system evaluates the sentiment expressed in the feedback.
4. **Defect Detection:** Potential product defects and safety-related indicators are identified.
5. **Risk Assessment:** Feedback is categorised according to the detected risk indicators.
6. **Decision Support:** The resulting information helps prioritise cases for further investigation and potential product-recall assessment.

## Potential Applications

- Early identification of recurring product complaints
- Detection of potential safety-related feedback
- Prioritisation of customer complaints for investigation
- Support for product-harm assessment and recall-related decisions
- Structured analysis of customer feedback for crisis management

## Limitations

This project is a decision-support prototype, not a substitute for expert safety assessment or regulatory review. Rule-based classifications may miss context, sarcasm, implicit complaints, or unfamiliar defect descriptions. Risk classifications should be validated before being used in real-world product-safety decisions.

## Academic Context

Developed as part of the **Designing Technology** course at Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU).

**Project domain:** Natural Language Processing, AI-Assisted Decision Support, Product Safety, and Crisis Management.

---

*The system is intended to support the early identification and prioritisation of potential product-harm indicators through structured customer-feedback analysis.*
