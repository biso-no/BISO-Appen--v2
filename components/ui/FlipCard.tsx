import { MotiView } from 'moti';
import { View, StyleSheet } from 'react-native';

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped?: boolean;
}

export function FlipCard({ frontContent, backContent, isFlipped = false }: FlipCardProps) {
  return (
    <View style={styles.container}>
      <MotiView
        animate={{
          opacity: isFlipped ? 0 : 1,
          scale: isFlipped ? 0.9 : 1,
        }}
        transition={{
          type: 'timing',
          duration: 300,
        }}
        style={[
          styles.content,
          { display: isFlipped ? 'none' : 'flex' }
        ]}
      >
        {frontContent}
      </MotiView>

      <MotiView
        animate={{
          opacity: isFlipped ? 1 : 0,
          scale: isFlipped ? 1 : 0.9,
        }}
        transition={{
          type: 'timing',
          duration: 300,
        }}
        style={[
          styles.content,
          { display: isFlipped ? 'flex' : 'none' }
        ]}
      >
        {backContent}
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  content: {
    width: '100%',
    position: 'relative',
  }
});
