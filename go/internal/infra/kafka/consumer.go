package kafka

import ckafka "github.com/confluentinc/confluent-kafka-go/kafka"

// Create a struct to producer with config map pointer and topics list
type Consumer struct {
	ConfigMap *ckafka.ConfigMap
	Topics    []string
}

// Function to create a new kafka consumer
func NewConsumer(configMap *ckafka.ConfigMap, topics []string) *Consumer {
	return &Consumer{
		ConfigMap: configMap,
		Topics:    topics,
	}
}

// Function to consume the topics
func (c *Consumer) Consume(msgChan chan *ckafka.Message) error {
	consumer, err := ckafka.NewConsumer(c.ConfigMap)
	if err != nil {
		panic(err)
	}
	err = consumer.SubscribeTopics(c.Topics, nil)
	if err != nil {
		panic(err)
	}
	for {
		msg, err := consumer.ReadMessage(-1)
		if err == nil {
			msgChan <- msg
		}
	}
}
