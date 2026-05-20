from __future__ import annotations

import numpy as np


def forecast_with_lstm_if_available(values: np.ndarray, periods: int = 30):
    """Optional PyTorch LSTM forecast.

    Returns None when torch is not installed so the app can fall back without
    breaking local/dev environments.
    """
    try:
        import torch 
        from torch import nn
    except Exception:
        return None

    if len(values) < 180:
        return None

    y = values.astype("float32")
    mean = float(y.mean())
    std = float(y.std() or 1.0)
    scaled = (y - mean) / std
    window = 14
    x_rows = []
    y_rows = []
    for index in range(window, len(scaled)):
        x_rows.append(scaled[index - window:index])
        y_rows.append(scaled[index])

    x = torch.tensor(np.asarray(x_rows), dtype=torch.float32).unsqueeze(-1)
    target = torch.tensor(np.asarray(y_rows), dtype=torch.float32).unsqueeze(-1)

    class DemandLSTM(nn.Module):
        def __init__(self):
            super().__init__()
            self.lstm = nn.LSTM(input_size=1, hidden_size=24, batch_first=True)
            self.head = nn.Linear(24, 1)

        def forward(self, batch):
            output, _ = self.lstm(batch)
            return self.head(output[:, -1, :])

    model = DemandLSTM()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.MSELoss()
    model.train()
    for _ in range(180):
        optimizer.zero_grad()
        prediction = model(x)
        loss = loss_fn(prediction, target)
        loss.backward()
        optimizer.step()

    model.eval()
    history = list(scaled)
    result = []
    with torch.no_grad():
        for _ in range(periods):
            batch = torch.tensor(history[-window:], dtype=torch.float32).reshape(1, window, 1)
            scaled_prediction = float(model(batch).item())
            history.append(scaled_prediction)
            result.append(max(scaled_prediction * std + mean, 0))

    return result
