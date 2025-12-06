import { Card, Title, Text, Radio, Stack, Textarea } from '@mantine/core';
import { AudioControls } from '../AudioControls';
import { ParsedAnswer } from '../../utils/voiceAnswerParser';

interface SingleChoiceQuestionProps {
  id: string;
  question: string;
  transparency: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  comment?: string;
  onCommentChange?: (comment: string) => void;
  audioEnabled?: boolean;
}

export function SingleChoiceQuestion({
  id,
  question,
  transparency,
  options,
  value,
  onChange,
  comment,
  onCommentChange,
  audioEnabled = false,
}: SingleChoiceQuestionProps) {
  const handleAudioAnswer = (answer: ParsedAnswer) => {
    // If text is provided, try to match to an option value
    if (answer.text) {
      const matchedOption = options.find(opt =>
        opt.label.toLowerCase() === answer.text?.toLowerCase() ||
        opt.value.toLowerCase() === answer.text?.toLowerCase()
      );

      if (matchedOption) {
        onChange(matchedOption.value);
      } else if (onCommentChange) {
        // If no match, append to comment
        const existingComment = comment || '';
        const newComment = existingComment
          ? `${existingComment} ${answer.text}`
          : answer.text;
        onCommentChange(newComment);
      }
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
            questionType="single-choice"
            questionOptions={optionLabels}
            onAnswerCaptured={handleAudioAnswer}
          />
        )}

        <Radio.Group value={value} onChange={onChange} name={id}>
          <Stack gap="sm">
            {options.map((option) => (
              <Radio key={option.value} value={option.value} label={option.label} />
            ))}
          </Stack>
        </Radio.Group>

        {onCommentChange && (
          <Textarea
            label="Additional comments (optional)"
            value={comment || ''}
            onChange={(e) => onCommentChange(e.currentTarget.value)}
            placeholder="Share any additional thoughts..."
            minRows={2}
            autosize
          />
        )}
      </Stack>
    </Card>
  );
}