import {inngest} from "@/lib/inngest/client";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendSummaryEmail, sendWelcomeEmail} from "@/lib/nodemailer";
import {getAllUserForNewsEmail} from "@/lib/actions/user.actions";
import {getWatchListSymbolsByEmail} from "@/lib/actions/watchlist.actions";
import {getNews} from "@/lib/actions/finhub.actions";
import {formatDateToday} from "@/lib/utils";

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
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Tickrflow. You now have the tools to track markets and make smarter moves.';
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

export const sendDailyNewsSummary = inngest.createFunction(
    {id: 'daily-news-summary'},
    [
        {event: 'app/send.daily.news'},
        {cron: '0 12 * * * '} //minute, hour, dayOfTheMonth, month, dayOfTheWeek
    ],

    async ({step}) => {
        //Step: 1 : get all users to send the news delivery
        const users = await step.run('get-all-users', getAllUserForNewsEmail)
        if (!users || users?.length === 0) return {success: false, message: 'No users found'};
        //Step 2 : Fetch personalized news
        const results = await step.run('fetch-user-news', async () => {
            const perUser = [];
            for (const user of users) {
                try {
                    const symbols = await getWatchListSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    articles = (articles || []).slice(0, 6);

                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }

                    perUser.push({user, articles})
                } catch (e) {
                    console.error(`daily-news: error preparing user news `, e);
                    perUser.push({user, articles: []});
                }
            }
            return perUser;
        })
        //Step 3: Summarize news using AI
        const userNewsSummaries: { user: User; newsContent: string | null }[] = [];
        for (const {user, articles} of results) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));

                const response = await step.ai.infer(`summarize-news-${user.email}`, {
                    model: step.ai.models.gemini({model: 'gemini-2.5-flash'}),
                    body: {
                        contents: [{role: 'user', parts: [{text: prompt}]}]
                    }
                });

                const part = response.candidates?.[0]?.content.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || 'No market news'

                userNewsSummaries.push({user, newsContent});

            } catch (e) {
                console.error('Failed to summarze news: ', user.email);
                userNewsSummaries.push({user, newsContent: null});
            }
        }


        //Step 4: Send Email

        await step.run('send-news-emails', async () => {
            await Promise.all(
                userNewsSummaries.map(async ({user, newsContent}) => {
                    if (!newsContent) return false;

                    return await sendSummaryEmail({email: user.email, date: formatDateToday(), newsContent})
                })
            )
        })


        return {success: true, message: 'Daily News Summary emails sent successfully.'}
    })