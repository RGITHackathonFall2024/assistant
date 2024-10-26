export function generateMockTickets(from: string, to: string, minCount = 5, maxCount = 15) {
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    const currentDate = new Date();
    
    // Helper to generate random future date (within next 30 days)
    const getRandomFutureTimestamp = () => {
        const futureDate = new Date(currentDate);
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30));
        return futureDate.getTime();
    };
    
    // Helper to generate random price between 50 and 500
    const getRandomPrice = () => Math.floor(Math.random() * 450) + 50;
    
    // Helper to generate random flight duration between 1 and 8 hours (in milliseconds)
    const getRandomDuration = () => (Math.floor(Math.random() * 7) + 1) * 3600000;
    
    const tickets = [];
    
    for (let i = 0; i < count; i++) {
        const departure = getRandomFutureTimestamp();
        const duration = getRandomDuration();
        const arrival = departure + duration;
        
        tickets.push({
            ticket_id: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            from,
            to,
            time: duration,
            price: getRandomPrice(),
            departure,
            arrival
        });
    }
    
    // Sort by departure time
    return tickets.sort((a, b) => a.departure - b.departure);
}
