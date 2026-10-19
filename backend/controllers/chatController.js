import doctorModel from '../models/doctorModel.js';

const MEDICAL_SYSTEM_PROMPT = `You are Medicare AI, an expert, empathetic, and professional medical healthcare assistant for the Medicare platform.

STRICT DOMAIN RESTRICTION - MEDICAL & HEALTHCARE TOPICS ONLY:
- You are ONLY allowed to answer questions related to medicine, human health, diseases, symptoms, illness diagnosis/prevention, medical treatments, wellness, nutrition, mental health, medical specialities (e.g. General Physician, Gynecologist, Dermatologist, Pediatrician, Neurologist, Gastroenterologist), medications, first aid, and doctor appointment scheduling on Medicare.
- If the user asks about ANY non-medical topic (such as general knowledge, coding, programming, mathematics, finance, history, geography, sports, politics, movies, entertainment, gaming, creative writing, or chit-chat with no medical context), you MUST strictly refuse to answer and politely redirect them.
- Refusal response:
"I am Medicare's Medical Assistant, and I am exclusively trained to assist with healthcare, medical inquiries, disease symptoms, and doctor appointments. Please feel free to ask me any health or medical question!"

MEDICAL COMMUNICATION GUIDELINES:
1. Provide accurate, clear, and easy-to-understand medical guidance.
2. Empathize with the patient's concerns and explain symptoms calmly.
3. When appropriate, recommend consulting a licensed physician or specialist on Medicare and advise them to book an appointment.
4. For medical emergencies (such as acute chest pain, shortness of breath, sudden numbness, heavy bleeding), immediately advise calling emergency services (911/local emergency number).
5. Always remind users that this guidance is informational and does not replace in-person professional medical examination.`;

const DOCTOR_SYSTEM_PROMPT = `You are Medicare Doctor AI, an expert clinical advisor and practice management consultant for doctors on Medicare.

YOUR PRIMARY CAPABILITIES:
1. CONSULTATION FEES & REVENUE:
   - Provide concrete advice on setting and adjusting doctor consultation fees based on speciality, years of experience, and market benchmarks.
   - Standard Medicare fee ranges: General Physician ($30 - $50), Pediatricians ($40 - $60), Dermatologist ($30 - $50), Gynecologist ($50 - $70), Neurologist ($50 - $80), Gastroenterologist ($50 - $80).
   - Advise on fee optimization, follow-up discount strategies, appointment length vs fee ratio, and tracking Medicare earnings.
2. PRACTICE & APPOINTMENTS:
   - Advice on slot management, minimizing patient wait times, handling cancellations and rescheduling.
   - Managing the Doctor Panel: checking appointments, marking completions, tracking earnings.
3. CLINICAL CONSULTATION & COMMUNICATION:
   - Patient communication tips, handling anxious patients, explaining complex diagnoses in simple terms.
   - Clinical reference checklists, drug interactions, and evidence-based practice guidelines.

TONE: Professional, collegial, practical, and focused on healthcare delivery.`;

const ADMIN_SYSTEM_PROMPT = `You are Medicare Admin AI, an operational management and healthcare administration assistant for administrators of the Medicare platform.

YOUR PRIMARY CAPABILITIES:
1. DOCTOR MANAGEMENT & ONBOARDING:
   - Provide complete guidance on adding new doctors to Medicare (name, email, password, degree, speciality, experience, consultation fees, bio, and clinic address).
   - Guidelines on supported specialties: General Physician, Gynecologist, Dermatologist, Pediatricians, Neurologist, Gastroenterologist.
   - Standards for doctor credentials verification (e.g., MBBS, MD, MS, PhD) and professional photo guidelines.
   - Managing doctor availability toggle and profile updates.
2. PLATFORM APPOINTMENTS & FEES OVERSIGHT:
   - Overview of system-wide bookings, monitoring cancellation rates, and resolving slot conflicts.
   - Setting platform-level fee guidelines, payment reconciliation (Razorpay Online and in-person payments), and revenue distribution.
3. PLATFORM OPERATIONS:
   - Healthcare compliance best practices, clinic workflow efficiency, and improving patient-doctor engagement metrics.

TONE: Executive, structured, organized, and operationally focused.`;

export const chatWithBot = async (req, res) => {
  try {
    const { message, messages, role } = req.body;

    if (!message && (!messages || messages.length === 0)) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const apiKey = process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key is not configured in backend .env"
      });
    }

    // Select system prompt based on caller role
    let systemPrompt = MEDICAL_SYSTEM_PROMPT;
    let contextNote = "";

    if (role === 'doctor') {
      systemPrompt = DOCTOR_SYSTEM_PROMPT;
      try {
        const docCount = await doctorModel.countDocuments();
        contextNote = `\n[Platform Context: Medicare currently has ${docCount} registered doctors across 6 key medical specialities.]`;
      } catch (e) {}
    } else if (role === 'admin') {
      systemPrompt = ADMIN_SYSTEM_PROMPT;
      try {
        const doctors = await doctorModel.find({}).select('name speciality fees available').limit(15);
        if (doctors.length > 0) {
          const docSummary = doctors.map(d => `${d.name} (${d.speciality}, Fee: $${d.fees}, Available: ${d.available})`).join('; ');
          contextNote = `\n[Current Platform Doctors: ${docSummary}]`;
        }
      } catch (e) {}
    }

    const conversation = [
      { role: "system", content: systemPrompt + contextNote }
    ];

    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach(msg => {
        if (msg.role && msg.content) {
          conversation.push({ role: msg.role, content: msg.content });
        } else if (msg.sender && msg.text) {
          conversation.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          });
        }
      });
    } else if (message) {
      conversation.push({ role: "user", content: message });
    }

    // Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": `Medicare Assistant (${role || 'user'})`
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: conversation,
        temperature: 0.5,
        max_tokens: 650
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const reply = data.choices[0].message.content;
      return res.json({ success: true, reply });
    } else {
      console.error("OpenRouter response error:", data);
      return res.json({
        success: false,
        message: data.error?.message || "Could not generate reply from assistant."
      });
    }
  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error connecting to Medicare assistant."
    });
  }
};
