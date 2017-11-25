const server = require('../server/server');
const data = require('./data')

const department_id =
    [("economia","E0101"),
    ("lettere","E0801"),
    ("filosofia","E0801"),
    ("mesiano","E0301"),
    ("ingegneria","E0301"),
    ("giurisprudenza","E0201"),
    ("sociologia","E0601"),
    ("scienze cognitive","E0705"),
    ("povo","E0503")];

//inArray function tests.
test('inArray("E0503") should return true', () => {
    expect(server.inArray('E0503')).toBeTruthy();
});

test('inArray("povo") should return false', () => {
    expect(server.inArray('povo')).not.toBeTruthy();
});

test('inArray("E0000") should return false', () => {
    expect(server.inArray('E0000')).not.toBeTruthy();
});  

test('inArray() to throw error', () => {
    expect(server.inArray).toThrow(Error);
}); 

test('inArray(23) to throw TypeError', () => {
    expect(function() {server.inArray(23)}).toThrow(TypeError);
}); 



const events = data.all.events;

//getRoomList function tests.
test('expect getRoomList() to throw error', () => {
    expect(server.getRoomList).toThrow(Error);
});

test('expect getRoomList(23) to throw TypeError', () => {
    expect(function() {server.getRoomList(23)}).toThrow(TypeError);
})

test('expect getRoomList(events) to be equal rooms', () => {
    expect(server.getRoomList(events)).toEqual(data.rooms);
})

const input = {};

test('expect getRoomList(input) with input as empty object to return empty array', () => {
    expect(server.getRoomList(input)).toEqual([]);
})


//cleanSchedule function tests.
test('expect cleanSchedule() to throw error', () => {
    expect(server.cleanSchedule).toThrow(Error);
});

test('expect cleanSchedule(23) to throw TypeError', () => {
    expect(function() {server.cleanSchedule(23)}).toThrow(TypeError);
})

test('expect cleanSchedule(input) with input as empty object to return empty object', () => {
    expect(server.cleanSchedule(input)).toEqual({});
})

test('expect cleanSchedule(data.rooms) to be equal data.cleanedSchedule', () => {
    expect(server.cleanSchedule(data.rooms)).toEqual(data.cleanedSchedule);
})


//getFreeRooms function tests.
test('expect getFreeRooms() to throw error', () => {
    expect(server.getFreeRooms).toThrow(Error);
});

test('expect getFreeRooms(12,23) to throw TypeError', () => {
    expect(function() {server.getFreeRooms(12,23)}).toThrow(TypeError);
})

test('expect getFreeRooms(12,{}) to throw TypeError', () => {
    expect(function() {server.getFreeRooms(12,{})}).toThrow(TypeError);
})

test('expect getFreeRooms(input,131234) with input as empty object to return empty object', () => {
    expect(server.getFreeRooms(input, 131234)).toEqual({});
})

test('expect getFreeRooms(data.cleanedSchedule) to be equal data.freeRooms', () => {
    expect(server.getFreeRooms(data.cleanedSchedule, 1511427600)).toEqual(data.freeRooms);
})
