export type BeachQuote = {
    text: string;
    author: string;
};

const BEACH_QUOTES: BeachQuote[] = [
    {
        text: 'The sea, once it casts its spell, holds one in its net of wonder forever.',
        author: 'Jacques Cousteau',
    },
    {
        text: "Someone told me the sound of the ocean is just white noise sped up a few million times. I don't know if that's true, but I like the idea of it.",
        author: 'Jenny Offill',
    },
    {
        text: 'The ocean stirs the heart, inspires the imagination, and brings eternal joy to the soul.',
        author: 'Robert Wyland',
    },
    {
        text: 'We are tied to the ocean. And when we go back to the sea, we are going back from whence we came.',
        author: 'John F. Kennedy',
    },
    { text: 'The waves were mountains moving.', author: 'Virginia Woolf' },
    {
        text: 'Study nature, love nature, stay close to nature. It will never fail you.',
        author: 'Frank Lloyd Wright',
    },
    {
        text: 'Everything I know I learned from the sea.',
        author: 'Rachel Carson',
    },
    {
        text: 'The cure for anything is salt water: sweat, tears, or the sea.',
        author: 'Isak Dinesen',
    },
    {
        text: 'A wave is never a single wave but a concentration of the entire ocean.',
        author: 'Chögyam Trungpa',
    },
    {
        text: 'In every outthrust headland, in every curving beach, in every grain of sand there is the story of the earth.',
        author: 'Rachel Carson',
    },
    {
        text: 'The sea is emotion incarnate. It loves, hates, and weeps.',
        author: 'Christopher Paolini',
    },
    {
        text: 'Every wave is unique and every situation and every day is unique.',
        author: 'Laird Hamilton',
    },
    {
        text: 'You can never cross the ocean until you have the courage to lose sight of the shore.',
        author: 'Christopher Columbus',
    },
    {
        text: 'The sea, the great unifier, is man’s only hope. Now, as never before, the old phrase has a literal meaning: we are all in the same boat.',
        author: 'Jacques Cousteau',
    },
    {
        text: 'Not all those who wander are lost, but most of us who wander towards the sea are searching for something.',
        author: 'Unknown',
    },
    {
        text: 'I must go down to the seas again, to the lonely sea and the sky.',
        author: 'John Masefield',
    },
    {
        text: 'There is nothing more enticingly, mysteriously exciting than an island — except, perhaps, two islands.',
        author: 'Richard Adams',
    },
    {
        text: 'Sunsets are proof that no matter what happens, every day can end beautifully.',
        author: 'Kristen Butler',
    },
    {
        text: 'The salt water heals what fresh water cannot.',
        author: 'Unknown',
    },
    { text: 'A day at the beach restores the soul.', author: 'Unknown' },
    {
        text: 'Live in the sunshine, swim the sea, drink the wild air.',
        author: 'Ralph Waldo Emerson',
    },
    {
        text: 'Life is better with sandy feet and salty hair.',
        author: 'Unknown',
    },
    { text: 'The ocean is a mighty harmonist.', author: 'William Wordsworth' },
    {
        text: 'Slow down, breathe in the salt air, and let the rhythm of the waves reset your soul.',
        author: 'Unknown',
    },
    {
        text: 'Waves are just water wanting to be somewhere else.',
        author: 'Unknown',
    },
    {
        text: 'The wave is not the water. The water merely told us about the wave passing by.',
        author: 'Alan Watts',
    },
];

/** Picks a fresh random quote — changes every time the page loads. */
export function pickRandomQuote(): BeachQuote {
    const index = Math.floor(Math.random() * BEACH_QUOTES.length);

    return BEACH_QUOTES[index];
}
