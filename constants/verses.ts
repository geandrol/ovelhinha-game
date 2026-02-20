export const BIBLICAL_VERSES = [
  {
    text: "Porque Deus é amor; quem permanece no amor permanece em Deus, e Deus nele.",
    reference: "1 João 4:16",
    simplified: "Porque Deus é amor quem permanece no amor permanece em Deus e Deus nele",
  },
  {
    text: "O mandamento é este: que vos ameis um ao outro, como eu vos amei.",
    reference: "João 13:34",
    simplified: "O mandamento é este que vos ameis um ao outro como eu vos amei",
  },
  {
    text: "Bem-aventurados os que têm fome e sede de justiça; porque eles serão fartos.",
    reference: "Mateus 5:6",
    simplified: "Bem aventurados os que têm fome e sede de justiça porque eles serão fartos",
  },
  {
    text: "A paz deixo com vós; a minha paz vos dou. Não vos dou como o mundo a dá.",
    reference: "João 14:27",
    simplified: "A paz deixo com vós a minha paz vos dou Não vos dou como o mundo a dá",
  },
  {
    text: "Abençoados os que promovem a paz, porque eles serão chamados filhos de Deus.",
    reference: "Mateus 5:9",
    simplified: "Abençoados os que promovem a paz porque eles serão chamados filhos de Deus",
  },
  {
    text: "Que a graça e a paz de Deus Pai e do Senhor Jesus Cristo estejam com vós.",
    reference: "Filipenses 1:2",
    simplified: "Que a graça e a paz de Deus Pai e do Senhor Jesus Cristo estejam com vós",
  },
  {
    text: "Porque o fruto do Espírito é: amor, alegria, paz, paciência, amabilidade.",
    reference: "Gálatas 5:22",
    simplified: "Porque o fruto do Espírito é amor alegria paz paciência amabilidade",
  },
  {
    text: "Portanto, sejam gentis, compasivos e perdoem-se mutuamente, como Cristo os perdoou.",
    reference: "Colossenses 3:13",
    simplified: "Portanto sejam gentis compasivos e perdoem se mutuamente como Cristo os perdoou",
  },
  {
    text: "Quem habita no esconderijo do Altíssimo descansa à sombra do Todo-Poderoso.",
    reference: "Salmos 91:1",
    simplified: "Quem habita no esconderijo do Altíssimo descansa à sombra do Todo Poderoso",
  },
  {
    text: "Aquietai-vos e conhecei que eu sou Deus; serei exaltado entre as nações.",
    reference: "Salmos 46:10",
    simplified: "Aquietai vos e conhecei que eu sou Deus serei exaltado entre as nações",
  },
];

export function getRandomVerse() {
  return BIBLICAL_VERSES[Math.floor(Math.random() * BIBLICAL_VERSES.length)];
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkVerseRecognition(spokenText: string, verse: typeof BIBLICAL_VERSES[0]): number {
  const normalizedSpoken = normalizeText(spokenText);
  const normalizedVerse = verse.simplified.toLowerCase();

  const spokenWords = normalizedSpoken.split(" ");
  const verseWords = normalizedVerse.split(" ");

  let matchedWords = 0;
  for (const word of spokenWords) {
    if (verseWords.includes(word)) {
      matchedWords++;
    }
  }

  // Calcula a porcentagem de acerto (baseado no número de palavras certas em relação ao total do versículo)
  const accuracy = (matchedWords / verseWords.length) * 100;
  return Math.min(100, accuracy);
}
