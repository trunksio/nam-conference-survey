import { Card, Title, Text, Stack, Select } from '@mantine/core';
import { AudioControls } from '../AudioControls';
import { ParsedAnswer } from '../../utils/voiceAnswerParser';

interface RankingQuestionProps {
  id: string;
  question: string;
  transparency: string;
  options: { value: string; label: string }[];
  rankings: Record<string, number>;
  onChange: (rankings: Record<string, number>) => void;
  audioEnabled?: boolean;
}

export function RankingQuestion({
  id: _id,
  question,
  transparency,
  options,
  rankings,
  onChange,
  audioEnabled = false,
}: RankingQuestionProps) {
  const rankOptions = ['1', '2', '3', '4'];

  const handleAudioAnswer = (answer: ParsedAnswer) => {
    // If ranking is provided, merge with existing rankings
    if (answer.ranking) {
      // Convert labels back to values
      const newRankings: Record<string, number> = {};

      for (const [label, rank] of Object.entries(answer.ranking)) {
        const matchedOption = options.find(opt =>
          opt.label.toLowerCase() === label.toLowerCase()
        );
        if (matchedOption) {
          newRankings[matchedOption.value] = rank;
        }
      }

      // Merge with existing rankings
      onChange({ ...rankings, ...newRankings });
    }
  };

  const optionLabels = options.map(opt => opt.label);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Title order={3} size="h4">
          {question}
        </Title>

        <Text size="sm" c="dimmed">
          {transparency}
        </Text>

        {audioEnabled && (
          <AudioControls
            questionText={question}
            questionType="ranking"
            questionOptions={optionLabels}
            onAnswerCaptured={handleAudioAnswer}
          />
        )}

        <Text size="sm" fw={500}>
          Rank each option from 1 (most valuable) to 4 (least valuable)
        </Text>

        <Stack gap="sm">
          {options.map((option) => (
            <Select
              key={option.value}
              label={option.label}
              placeholder="Select rank"
              data={rankOptions}
              value={rankings[option.value]?.toString() || ''}
              onChange={(rank) => {
                onChange({
                  ...rankings,
                  [option.value]: rank ? parseInt(rank) : 0,
                });
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}