package kafka

import ckafka "github.com/confluentinc/confluent-kafka-go/kafka"

// Create a struct to producer with config map pointer 
type Producer struct {
	ConfigMap *ckafka.ConfigMap
}

// Function to create a new kafka producer
func NewKafkaProducer(configMap *ckafka.ConfigMap) *Producer {
	return &Producer{
		ConfigMap: configMap,
	}
}

// Function to publish a message in kafka
func (p *Producer) Publish(msg interface{}, key []byte, topic string) error {
	producer, err := ckafka.NewProducer(p.ConfigMap)
	if err != nil {
		return err
	}

	message := &ckafka.Message{
		TopicPartition: ckafka.TopicPartition{Topic: &topic, Partition: ckafka.PartitionAny},
		Key:            key,
		Value:          msg.([]byte),
	}

	err = producer.Produce(message, nil)
	if err != nil {
		return err
	}
	return nil
}
