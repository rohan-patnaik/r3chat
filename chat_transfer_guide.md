
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Order of todo when you wanna do chat-transfer with no context loss

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

1. Working code to be git pushed with nice git message

2. Use request1 on chat1 to get response1.
3. Get response1(prompt_new_chat.txt and PRD.md). 

4. Then use request2 on chat1 to get reponse2.
5. Get response2(Updated r3chat_PRD.md).

6. Update repomix codebase and store as r3chat_codebase.md.

7. Then use request3 in chat1 to get response3.
8. Get response3(AI_State_Prompt.md)

9. Paste response3 in chat2 message1 as prompt and not as "Pasted Text 1" along with "Updated r3chat_PRD.md" and "r3chat_codebase.md".
10. Withing this message1 include last technical question of chat1 inside 
"""""last technical question"""""



--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

request1 = summarization_text = "Summarize this conversation in a way that can be used to prompt another session of you and convey as much relevant detail/context as possible. I guess i'm asking you so translate this conversation into a language designed just for you. Also give me the updated r3chat_PRD.md for the same as well in markdown"

request2 = update_prd = "Update this PRD you generated with more tasks as below in proper task based format.
line-break
line-break
(Add last question about coding I wanted to ask chat1 here)"

request3 = "Write a detailed prompt which will be passed to an LLM as input which gives the codebase as "r3chat_codebase.md", the PRD as "r3chat_PRD.md" and asks it to start working on the tasks 1 Epic at a time for my R3Chat app that has been described as above in the PRD itself.
The LLM should also mention the strategy to complete the next Epic on its list.
The LLM should give a concise git commit message for each Epic it completes along with its ticket number.
All the codefiles need to be fully copy-pastable to save user time and should not include any placeholder code at all.
LLM should analyze and memorize all these requests before starting to proceed."