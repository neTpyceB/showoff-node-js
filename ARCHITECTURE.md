# Architecture

## Services

- API service publishes events to the Redis Streams bus and serves read models.
- Notifications service consumes events and builds `notifications:<userId>`.
- Feed service consumes events and builds `feed:<userId>`.
- Audit service consumes events and builds `audit`.
- Redis stores the event stream and the eventually consistent projections.

## Flow

- Client publishes `POST /events`.
- API appends the event to the `events` stream.
- Each worker service consumes the same event through its own consumer group.
- Successful processing appends projection data and acknowledges the stream entry.
- Failed processing leaves the entry pending until the retry cycle claims it again.

## Consistency

- `POST /events` is accepted before projections are updated.
- Notifications, feed, and audit are eventually consistent views derived from the same event stream.

## Runtime

- One shared Node image
- One API container
- Three worker containers
- One Redis container
- One test container
