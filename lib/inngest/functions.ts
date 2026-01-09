import {inngest} from "@/lib/inngest/client";
import {PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendWelcomeEmail} from "@/lib/nodemailer";

export const sendSignUpEmail = inngest.createFunction({
        id: 'sign-up-email',

    },
    {event: 'app/user.created'},
    //handler function
    async ({event, step}) => {
        // Here goes the business logic
        // By wrapping code in steps, it will be retried automatically on failure
        const userProfile = `
        - Country: ${event.data.country}
        -Investment goals: ${event.data.investmentGoals}
        -Risk tolerance: ${event.data.investmentGoals}
        -Preffered industry: ${event.data.investmentGoals}
        `;
        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({
                model: 'gemini-2.5-flash'
            }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {text: prompt}
                        ]
                    }
                ]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Tickrflow. You now have the tools to track marktes and make smarter moves.';
            //Email sending logic

            const {data: {email, name}} = event;
            return await sendWelcomeEmail({
                email,
                name,
                intro: introText,
            })
        })

        return {
            success: true,
            message: 'Welcome email sent successfully.'
        }
    }
)