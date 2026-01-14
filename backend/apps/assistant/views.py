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
            "You are a helpful website assistant. Answer ONLY about this website using the provided context. "
            "If something is not in the context, ask a short clarifying question or say it's not available."
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
