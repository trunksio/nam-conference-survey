import { Card, Title, Text, Textarea, Stack } from '@mantine/core';
import { AudioControls } from '../AudioControls';
import { ParsedAnswer } from '../../utils/voiceAnswerParser';

interface OpenEndedQuestionProps {
  id: string;
  question: string;
  transparency: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  audioEnabled?: boolean;
}

export function OpenEndedQuestion({
  id: _id,
  question,
  transparency,
  value,
  onChange,
  placeholder = 'Share your thoughts...',
  audioEnabled = false,
}: OpenEndedQuestionProps) {
  const handleAudioAnswer = (answer: ParsedAnswer) => {
    // Append text to existing value
    if (answer.text) {
      const existingValue = value || '';
      const newValue = existingValue
        ? `${existingValue} ${answer.text}`
        : answer.text;
      onChange(newValue);
    }
  };

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
            questionType="open-ended"
            onAnswerCaptured={handleAudioAnswer}
          />
        )}

        <Textarea
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder={placeholder}
          minRows={4}
          autosize
          maxRows={8}
        />
      </Stack>
    </Card>
  );
}