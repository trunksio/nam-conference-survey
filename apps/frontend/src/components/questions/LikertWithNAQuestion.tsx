import { Card, Title, Text, Radio, Stack, Textarea } from '@mantine/core';
import { AudioControls } from '../AudioControls';
import { ParsedAnswer } from '../../utils/voiceAnswerParser';

interface LikertOption {
  value: string;
  label: string;
}

interface LikertWithNAQuestionProps {
  id: string;
  question: string;
  transparency: string;
  value: string | null;
  onChange: (value: string | null) => void;
  readonly options?: readonly LikertOption[];
  naLabel?: string;
  comment?: string;
  onCommentChange?: (comment: string) => void;
  commentPlaceholder?: string;
  commentLabel?: string;
  audioEnabled?: boolean;
}

const DEFAULT_OPTIONS: LikertOption[] = [
  { value: '5', label: '5 - Strongly Agree' },
  { value: '4', label: '4 - Agree' },
  { value: '3', label: '3 - Neutral' },
  { value: '2', label: '2 - Disagree' },
  { value: '1', label: '1 - Strongly Disagree' },
];

export function LikertWithNAQuestion({
  id,
  question,
  transparency,
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  naLabel = 'Not Applicable',
  comment,
  onCommentChange,
  commentPlaceholder = 'Share any additional thoughts...',
  commentLabel = 'Additional comments (optional)',
  audioEnabled = false,
}: LikertWithNAQuestionProps) {
  // Combine provided options with N/A option
  const allOptions = [...options, { value: 'NA', label: naLabel }];

  const handleAudioAnswer = (answer: ParsedAnswer) => {
    // Set N/A if indicated
    if (answer.isNA) {
      onChange('NA');
    }
    // Set score if provided
    else if (answer.score !== undefined) {
      onChange(answer.score.toString());
    }

    // Append additional text to comment if provided
    if (answer.text && onCommentChange) {
      const existingComment = comment || '';
      const newComment = existingComment
        ? `${existingComment} ${answer.text}`
        : answer.text;
      onCommentChange(newComment);
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
            questionType="likert-na"
            onAnswerCaptured={handleAudioAnswer}
          />
        )}

        <Radio.Group
          value={value || ''}
          onChange={onChange}
          name={id}
        >
          <Stack gap="sm">
            {allOptions.map((option) => (
              <Radio key={option.value} value={option.value} label={option.label} />
            ))}
          </Stack>
        </Radio.Group>

        {onCommentChange && (
          <Textarea
            label={commentLabel}
            value={comment || ''}
            onChange={(e) => onCommentChange(e.currentTarget.value)}
            placeholder={commentPlaceholder}
            minRows={2}
            autosize
          />
        )}
      </Stack>
    </Card>
  );
}
