
import json

def load_json_file(filepath):
    f = open(filepath, 'r')
    json_obj = json.loads(f.read())
    f.close()
    return json_obj

for data_name in [
    '2023_0130_1419_k=1.0',
    '2023_0130_1439_k=1.5',
    '2023_0130_1447_k=0.5',
    '2023_0130_1454_k=0.25',
    '2023_0130_1511_k=0.20',
    '2023_0130_1515_k=0.15',
    '2023_0130_1518_k=0.10',
    '2023_0130_1532_k=0.09',
]:
    print('\n{}:'.format(data_name))

    data = load_json_file(data_name + '.json')
    histories = data

    max_range = 0
    for agent_id, track_history in histories.items():
        lo = min(track_history['lane'])
        hi = max(track_history['lane'])
        # print('\tAgent #{} : lo={} , hi={}'.format(agent_id, lo, hi))
        if hi-lo > max_range:
            max_range = hi-lo

    print('\tmax_range={}'.format(max_range))

