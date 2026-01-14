from django.shortcuts import render

# Create your views here.

import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

class AssistantChatAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        message = (request.data.get("message") or "").strip()
        page_url = request.data.get("pageUrl") or ""
        site_context = request.data.get("siteContext") or {}
        history = request.data.get("history") or []

        if not message:
            return Response({"answer": "Ask me a question about the website."}, status=status.HTTP_200_OK)

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or OpenAI is None:
            answer = (
                "AI is not configured yet. Add OPENAI_API_KEY on the backend.\n\n"
                f"You asked: {message}\n"
                f"Page: {page_url}"
            )
            return Response({"answer": answer}, status=status.HTTP_200_OK)

        client = OpenAI(api_key=api_key)

        system = (
            "You are a helpful assistant for the P2P Learning Platform website. "
            "Your role is to help users navigate the site and understand its features.\n\n"
            "IMPORTANT INSTRUCTIONS:\n"
            "1. Answer ONLY about this website - its features, navigation, and how to use it\n"
            "2. Be specific - use actual page names, button labels, and navigation steps\n"
            "3. Give step-by-step instructions when needed\n"
            "4. If something is not in the context, politely say you don't have that information\n"
            "5. Keep responses concise (2-3 sentences max unless explaining steps)\n\n"
            "The site has these main sections:\n"
            "- Dashboard: Overview of sessions, materials, discussions\n"
            "- Sessions: Schedule/manage tutoring (My Sessions, All Upcoming, Completed tabs)\n"
            "- Materials: Browse/upload study materials\n"
            "- Forum: Ask questions and discuss topics\n"
            "- Support: Contact support\n\n"
            "Common actions users ask about:\n"
            "- 'Where can I see sessions?' → Sessions page → My Sessions tab\n"
            "- 'How to schedule?' → Sessions → Schedule Session button\n"
            "- 'How to confirm session?' → Sessions → My Sessions → Confirm button (tutors)\n"
            "- 'Where are materials?' → Materials in sidebar"
        )

        messages = [{"role": "system", "content": system}]
        messages.append({"role": "system", "content": f"Site context: {site_context}"})
        messages.append({"role": "system", "content": f"Current page URL: {page_url}"})

        for h in history[-12:]:
            r = h.get("role")
            c = h.get("content")
            if r in ["user", "assistant"] and isinstance(c, str) and c.strip():
                messages.append({"role": r, "content": c})

        messages.append({"role": "user", "content": message})

        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.2,
        )

        answer = resp.choices[0].message.content or "Sorry, I couldn't generate an answer."
        return Response({"answer": answer}, status=status.HTTP_200_OK)
