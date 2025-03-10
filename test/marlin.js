import { test } from 'tap';
import MarlinRunner from '../src/server/controllers/Marlin/MarlinRunner';

test('MarlinLineParserResultEcho', (t) => {
    const runner = new MarlinRunner();
    runner.on('echo', ({ raw, message }) => {
        t.equal(raw, 'echo:message');
        t.equal(message, 'message');
        t.end();
    });

    const line = 'echo:message';
    runner.parse(line);
});

test('MarlinLineParserResultError', (t) => {
    const runner = new MarlinRunner();
    runner.on('error', ({ raw, message }) => {
        t.equal(raw, 'Error:Printer halted. kill() called!');
        t.equal(message, 'Printer halted. kill() called!');
        t.end();
    });

    const line = 'Error:Printer halted. kill() called!';
    runner.parse(line);
});

test('MarlinLineParserResultFirmware', (t) => {
    const runner = new MarlinRunner();
    runner.on('firmware', (payload) => {
        const { raw, firmwareName, protocolVersion, machineType, extruderCount, uuid } = payload;

        t.equal(raw, 'FIRMWARE_NAME:Marlin 1.1.0 (Github) SOURCE_CODE_URL:https://github.com/MarlinFirmware/Marlin PROTOCOL_VERSION:1.0 MACHINE_TYPE:RepRap EXTRUDER_COUNT:1 UUID:cede2a2f-41a2-4748-9b12-c55c62f367ff');
        t.equal(firmwareName, 'Marlin 1.1.0');
        t.equal(protocolVersion, '1.0');
        t.equal(machineType, 'RepRap');
        t.equal(extruderCount, 1);
        t.equal(uuid, 'cede2a2f-41a2-4748-9b12-c55c62f367ff');
        t.end();
    });

    const line = 'FIRMWARE_NAME:Marlin 1.1.0 (Github) SOURCE_CODE_URL:https://github.com/MarlinFirmware/Marlin PROTOCOL_VERSION:1.0 MACHINE_TYPE:RepRap EXTRUDER_COUNT:1 UUID:cede2a2f-41a2-4748-9b12-c55c62f367ff';
    runner.parse(line);
});

test('MarlinLineParserResultOk', (t) => {
    const runner = new MarlinRunner();
    runner.on('ok', ({ raw }) => {
        t.equal(raw, 'ok');
        t.end();
    });

    const line = 'ok';
    runner.parse(line);
});

test('MarlinLineParserResultPosition', (t) => {
    t.test('X/Y/Z/E', (t) => {
        const runner = new MarlinRunner();
        runner.on('pos', ({ raw, pos }) => {
            t.equal(raw, 'X:1.529 Y:-5.440 Z:0.00 E:0.00 Count X:0 Y:0 Z:0');
            t.same(pos, {
                x: '1.529',
                y: '-5.440',
                z: '0.00',
                e: '0.00'
            });
            t.end();
        });

        const line = 'X:1.529 Y:-5.440 Z:0.00 E:0.00 Count X:0 Y:0 Z:0';
        runner.parse(line);
    });

    t.test('X/Y/Z/A/B/C', (t) => {
        const runner = new MarlinRunner();
        runner.on('pos', ({ raw, pos }) => {
            t.equal(raw, 'X:20.000 Y:41.000 Z:38.000 A:34.000 B:24.000 C:17.000 Count X:9311 Y:18922 Z:15200 A:536 B:378 C:268');
            t.same(pos, {
                x: '20.000',
                y: '41.000',
                z: '38.000',
                a: '34.000',
                b: '24.000',
                c: '17.000',
            });
            t.end();
        });

        const line = 'X:20.000 Y:41.000 Z:38.000 A:34.000 B:24.000 C:17.000 Count X:9311 Y:18922 Z:15200 A:536 B:378 C:268';
        runner.parse(line);
    });

    t.end();
});

test('MarlinLineParserResultStart', (t) => {
    const runner = new MarlinRunner();
    runner.on('start', ({ raw }) => {
        t.equal(raw, 'start');
        t.end();
    });

    const line = 'start';
    runner.parse(line);
});

test('MarlinLineParserResultTemperature', (t) => {
    t.test('ok T:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, 'ok T:0');
            t.equal(ok, true);
            t.same(extruder, {});
            t.same(heatedBed, {});
            t.same(hotend, {});
            t.equal(wait, undefined);
            t.end();
        });

        const line = 'ok T:0';
        runner.parse(line);
    });

    t.test('ok T:293.0 /0.0 B:25.9 /0.0 @:0 B@:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, 'ok T:293.0 /0.0 B:25.9 /0.0 @:0 B@:0');
            t.equal(ok, true);
            t.same(extruder, {
                deg: '293.0',
                degTarget: '0.0',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '25.9',
                degTarget: '0.0',
                power: 0,
            });
            t.same(hotend, {});
            t.equal(wait, undefined);
            t.end();
        });

        const line = 'ok T:293.0 /0.0 B:25.9 /0.0 @:0 B@:0';
        runner.parse(line);
    });

    t.test('ok T:293.0 /0.0 B:25.9 /0.0 T0:293.0 /0.0 T1:100.0 /0.0 @:0 B@:0 @0:0 @1:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, 'ok T:293.0 /0.0 B:25.9 /0.0 T0:293.0 /0.0 T1:100.0 /0.0 @:0 B@:0 @0:0 @1:0');
            t.equal(ok, true);
            t.same(extruder, {
                deg: '293.0',
                degTarget: '0.0',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '25.9',
                degTarget: '0.0',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '293.0',
                    degTarget: '0.0',
                    power: 0,
                },
                T1: {
                    deg: '100.0',
                    degTarget: '0.0',
                    power: 0,
                },
            });
            t.equal(wait, undefined);
            t.end();
        });

        const line = 'ok T:293.0 /0.0 B:25.9 /0.0 T0:293.0 /0.0 T1:100.0 /0.0 @:0 B@:0 @0:0 @1:0';
        runner.parse(line);
    });

    t.test('ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, 'ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0');
            t.equal(ok, true);
            t.same(extruder, {
                deg: '293.0',
                degTarget: '0.0',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '25.9',
                degTarget: '0.0',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '293.0',
                    degTarget: '0.0',
                    power: 0,
                },
                T1: {
                    deg: '100.0',
                    degTarget: '0.0',
                    power: 0,
                },
            });
            t.equal(wait, undefined);
            t.end();
        });

        const line = 'ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0';
        runner.parse(line);
    });

    t.test('ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0 W:?', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, 'ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0 W:?');
            t.equal(ok, true);
            t.same(extruder, {
                deg: '293.0',
                degTarget: '0.0',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '25.9',
                degTarget: '0.0',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '293.0',
                    degTarget: '0.0',
                    power: 0,
                },
                T1: {
                    deg: '100.0',
                    degTarget: '0.0',
                    power: 0,
                },
            });
            t.equal(wait, '?');
            t.end();
        });

        const line = 'ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0 W:?';
        runner.parse(line);
    });

    t.test('ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0 W:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, 'ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0 W:0');
            t.equal(ok, true);
            t.same(extruder, {
                deg: '293.0',
                degTarget: '0.0',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '25.9',
                degTarget: '0.0',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '293.0',
                    degTarget: '0.0',
                    power: 0,
                },
                T1: {
                    deg: '100.0',
                    degTarget: '0.0',
                    power: 0,
                },
            });
            t.equal(wait, '0');
            t.end();
        });

        const line = 'ok T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0 W:0';
        runner.parse(line);
    });

    t.test(' T:293.0 /0.0 B:25.9 /0.0 @:0 B@:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, ' T:293.0 /0.0 B:25.9 /0.0 @:0 B@:0');
            t.equal(ok, false);
            t.same(extruder, {
                deg: '293.0',
                degTarget: '0.0',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '25.9',
                degTarget: '0.0',
                power: 0,
            });
            t.same(hotend, {});
            t.equal(wait, undefined);
            t.end();
        });

        const line = ' T:293.0 /0.0 B:25.9 /0.0 @:0 B@:0';
        runner.parse(line);
    });

    t.test(' T:293.0 /0.0 B:25.9 /0.0 T0:293.0 /0.0 T1:100.0 /0.0 @:0 B@:0 @0:0 @1:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, ' T:293.0 /0.0 B:25.9 /0.0 T0:293.0 /0.0 T1:100.0 /0.0 @:0 B@:0 @0:0 @1:0');
            t.equal(ok, false);
            t.same(extruder, {
                deg: '293.0',
                degTarget: '0.0',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '25.9',
                degTarget: '0.0',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '293.0',
                    degTarget: '0.0',
                    power: 0,
                },
                T1: {
                    deg: '100.0',
                    degTarget: '0.0',
                    power: 0,
                },
            });
            t.equal(wait, undefined);
            t.end();
        });

        const line = ' T:293.0 /0.0 B:25.9 /0.0 T0:293.0 /0.0 T1:100.0 /0.0 @:0 B@:0 @0:0 @1:0';
        runner.parse(line);
    });

    t.test(' T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, ' T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0');
            t.equal(ok, false);
            t.same(extruder, {
                deg: '293.0',
                degTarget: '0.0',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '25.9',
                degTarget: '0.0',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '293.0',
                    degTarget: '0.0',
                    power: 0,
                },
                T1: {
                    deg: '100.0',
                    degTarget: '0.0',
                    power: 0,
                },
            });
            t.equal(wait, undefined);
            t.end();
        });

        const line = ' T:293.0 /0.0 (0.0) B:25.9 /0.0 T0:293.0 /0.0 (0.0) T1:100.0 /0.0 (0.0) @:0 B@:0 @0:0 @1:0';
        runner.parse(line);
    });

    t.test('ok T0:27.58 /0.00 B:28.27 /0.00 T0:27.58 /0.00 T1:27.37 /0.00 @:0 B@:0 @0:0 @1:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, 'ok T0:27.58 /0.00 B:28.27 /0.00 T0:27.58 /0.00 T1:27.37 /0.00 @:0 B@:0 @0:0 @1:0');
            t.equal(ok, true);
            t.same(extruder, {
                deg: '27.58',
                degTarget: '0.00',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '28.27',
                degTarget: '0.00',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '27.58',
                    degTarget: '0.00',
                    power: 0,
                },
                T1: {
                    deg: '27.37',
                    degTarget: '0.00',
                    power: 0,
                },
            });
            t.equal(wait, undefined);
            t.end();
        });

        const line = 'ok T0:27.58 /0.00 B:28.27 /0.00 T0:27.58 /0.00 T1:27.37 /0.00 @:0 B@:0 @0:0 @1:0';
        runner.parse(line);
    });

    // T0 is the active extruder
    t.test(' T0:27.72 /0.00 B:28.38 /0.00 T0:27.72 /0.00 T1:27.28 /0.00 @:0 B@:0 @0:0 @1:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, ' T0:27.72 /0.00 B:28.38 /0.00 T0:27.72 /0.00 T1:27.28 /0.00 @:0 B@:0 @0:0 @1:0');
            t.equal(ok, false);
            t.same(extruder, {
                deg: '27.72',
                degTarget: '0.00',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '28.38',
                degTarget: '0.00',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '27.72',
                    degTarget: '0.00',
                    power: 0,
                },
                T1: {
                    deg: '27.28',
                    degTarget: '0.00',
                    power: 0,
                },
            });
            t.equal(wait, undefined);
            t.end();
        });

        const line = ' T0:27.72 /0.00 B:28.38 /0.00 T0:27.72 /0.00 T1:27.28 /0.00 @:0 B@:0 @0:0 @1:0';
        runner.parse(line);
    });

    // T1 is the active extruder
    t.test(' T0:27.28 /0.00 B:28.38 /0.00 T0:27.72 /0.00 T1:27.28 /0.00 @:0 B@:0 @0:0 @1:0', (t) => {
        const runner = new MarlinRunner();
        runner.on('temperature', ({ raw, ok, extruder, heatedBed, hotend, wait }) => {
            t.equal(raw, ' T0:27.28 /0.00 B:28.38 /0.00 T0:27.72 /0.00 T1:27.28 /0.00 @:0 B@:0 @0:0 @1:0');
            t.equal(ok, false);
            t.same(extruder, {
                deg: '27.28',
                degTarget: '0.00',
                power: 0,
            });
            t.same(heatedBed, {
                deg: '28.38',
                degTarget: '0.00',
                power: 0,
            });
            t.same(hotend, {
                T0: {
                    deg: '27.72',
                    degTarget: '0.00',
                    power: 0,
                },
                T1: {
                    deg: '27.28',
                    degTarget: '0.00',
                    power: 0,
                },
            });
            t.equal(wait, undefined);
            t.end();
        });

        const line = ' T0:27.28 /0.00 B:28.38 /0.00 T0:27.72 /0.00 T1:27.28 /0.00 @:0 B@:0 @0:0 @1:0';
        runner.parse(line);
    });

    t.end();
});
