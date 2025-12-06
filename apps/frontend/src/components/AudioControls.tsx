import { useState, useEffect } from 'react';
import { Group, ActionIcon, Text, Stack, Button, Paper, Box } from '@mantine/core';
import { IconVolume, IconMicrophone, IconCheck, IconX } from '@tabler/icons-react';
import { useAudioSurvey } from '../hooks/useAudioSurvey';
import {
  parseLikertAnswer,
  parseLikertWithNAAnswer,
  parseMultipleSelectAnswer,
  parseSingleChoiceAnswer,
  parseRankingAnswer,
  parseOpenEndedAnswer,
  ParsedAnswer,
} from '../utils/voiceAnswerParser';

export type QuestionType = 'likert' | 'likert-na' | 'multiple-select' | 'single-choice' | 'ranking' | 'open-ended';

interface AudioControlsProps {
  questionText: string;
  questionOptions?: string[];
  onAnswerCaptured: (answer: ParsedAnswer) => void;
  questionType: QuestionType;
}

export function AudioControls({
  questionText,
  questionOptions = [],
  onAnswerCaptured,
  questionType,
}: AudioControlsProps) {
  const { isSpeaking, isListening, speakText, startListening, stopListening, transcript, resetTranscript } =
    useAudioSurvey();

  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  // Show transcript panel when we have a transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setShowTranscript(true);
    }
  }, [transcript, isListening]);

  const handleSpeak = async () => {
    // Build full text to speak
    let textToSpeak = questionText;

    // Add options for choice questions
    if (questionType === 'likert' || questionType === 'likert-na') {
      if (questionOptions.length > 0) {
        // Use actual options from the question (includes N/A for likert-na)
        textToSpeak += '. Options are: ' + questionOptions.join(', ') + '.';
      } else {
        // Fallback to default labels if no options provided
        textToSpeak += '. Options are: 1 - Strongly Disagree, 2 - Disagree, 3 - Neutral, 4 - Agree, 5 - Strongly Agree.';
        if (questionType === 'likert-na') {
          textToSpeak += ' Or say "Not Applicable" to skip.';
        }
      }
    } else if (questionType === 'multiple-select' && questionOptions.length > 0) {
      textToSpeak += '. Options are: ' + questionOptions.join(', ');
    } else if (questionType === 'single-choice' && questionOptions.length > 0) {
      textToSpeak += '. Options are: ' + questionOptions.join(', ');
    } else if (questionType === 'ranking' && questionOptions.length > 0) {
      textToSpeak += '. Items to rank are: ' + questionOptions.join(', ');
    }

    await speakText(textToSpeak);
  };

  const handleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setShowTranscript(false);
      startListening();
    }
  };

  const handleConfirm = () => {
    if (!transcript) return;

    let parsed: ParsedAnswer;

    switch (questionType) {
      case 'likert':
        parsed = parseLikertAnswer(transcript);
        break;
      case 'likert-na':
        parsed = parseLikertWithNAAnswer(transcript);
        break;
      case 'multiple-select':
        parsed = parseMultipleSelectAnswer(transcript, questionOptions);
        break;
      case 'single-choice':
        parsed = parseSingleChoiceAnswer(transcript, questionOptions);
        break;
      case 'ranking':
        parsed = parseRankingAnswer(transcript, questionOptions);
        break;
      case 'open-ended':
        parsed = parseOpenEndedAnswer(transcript);
        break;
      default:
        parsed = { text: transcript };
    }

    onAnswerCaptured(parsed);
    resetTranscript();
    setShowTranscript(false);
  };

  const handleRetry = () => {
    resetTranscript();
    setShowTranscript(false);
    startListening();
  };

  const handleCancel = () => {
    resetTranscript();
    setShowTranscript(false);
  };

  return (
    <Stack gap="sm">
      <Group gap="sm">
        <ActionIcon
          variant="light"
          color="equalBlue"
          size="lg"
          onClick={handleSpeak}
          disabled={isSpeaking || isListening}
          title="Read question aloud"
        >
          <IconVolume size={20} />
        </ActionIcon>

        <ActionIcon
          variant={isListening ? 'filled' : 'light'}
          color="equalBlue"
          size="lg"
          onClick={handleListen}
          disabled={isSpeaking}
          title={isListening ? 'Stop recording' : 'Record answer'}
          style={
            isListening
              ? {
                  animation: 'pulse 1.5s ease-in-out infinite',
                }
              : undefined
          }
        >
          <IconMicrophone size={20} />
        </ActionIcon>

        {isListening && (
          <Text size="sm" c="equalBlue" fw={500}>
            Listening...
          </Text>
        )}

        {isSpeaking && (
          <Text size="sm" c="dimmed" fw={500}>
            Speaking...
          </Text>
        )}
      </Group>

      {showTranscript && transcript && (
        <Paper p="md" withBorder>
          <Stack gap="sm">
            <Box>
              <Text size="xs" fw={500} c="dimmed" mb={4}>
                You said:
              </Text>
              <Text size="sm">{transcript}</Text>
            </Box>

            <Group gap="xs">
              <Button
                size="xs"
                color="green"
                leftSection={<IconCheck size={16} />}
                onClick={handleConfirm}
              >
                Confirm
              </Button>
              <Button size="xs" variant="light" onClick={handleRetry}>
                Retry
              </Button>
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                leftSection={<IconX size={16} />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </Stack>
  );
}
