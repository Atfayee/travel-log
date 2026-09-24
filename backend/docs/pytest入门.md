# 用 Travel Log 项目学习 pytest

这份文档以当前项目代码为例。建议边读边打开 `tests/conftest.py` 和 `tests/test_trips.py`。先读懂一个测试，再理解 fixture，最后自己补上 Visit 和统计接口的测试。

## 1. pytest 帮你做什么？

你手动测试接口时，通常会准备数据、发送请求、检查返回结果。pytest 让你把这些操作写成 Python 函数，以后修改代码时可以反复执行。

项目里的测试会调用真实的 FastAPI 路由和测试数据库，因此属于接口集成测试。通过测试，表示被检查的场景符合预期，不表示所有功能都没有问题。

先看 `tests/test_health.py` 中的例子：

```python
def test_liveness(client):
    response = client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "alive"}
```

逐行理解：

| 代码 | 含义 |
| --- | --- |
| `def test_liveness(...)` | 定义一个 pytest 可以发现的测试函数 |
| `client` | 由 fixture 提供的测试客户端 |
| `client.get(...)` | 向应用发送 GET 请求 |
| `response.status_code` | HTTP 状态码 |
| `response.json()` | 把 JSON 响应解析成 Python 字典或列表 |
| `assert 条件` | 条件为假时，测试失败并显示差异 |

`assert` 是 Python 语法。这里的两个断言分别检查“请求成功”和“返回内容正确”。只检查状态码，可能遗漏数据错误。

## 2. 先认识项目中的文件

```text
backend/
├── app/
│   ├── main.py             # API 路由和业务处理
│   ├── models.py           # SQLAlchemy 数据库模型
│   ├── schemas.py          # 请求与响应的数据结构、校验规则
│   └── database.py         # 正常运行时的数据库连接与 get_db
├── tests/
│   ├── conftest.py         # 共享 fixture：数据库、客户端、基础数据
│   ├── test_health.py      # 存活和数据库就绪检查
│   ├── test_trips.py       # 创建和读取旅行
│   ├── test_visits.py      # 当前为空，可用来练习
│   └── test_statistics.py  # 当前为空，可用来练习
└── requirements.txt
```

本项目统一使用 `test_*.py` 文件和 `test_*` 函数。pytest 会自动收集这些测试；空文件没有测试可执行。

`conftest.py` 是 pytest 约定的共享配置文件。放在 `tests/` 中的 fixture 可以供该目录及其子目录的测试使用，测试文件不需要手动导入它们。

## 3. 运行前准备

在 `backend` 目录中，使用 IDE 对应的 Python 虚拟环境。依赖已安装的话，可以跳过安装：

```bash
python -m pip install -r requirements.txt
```

### 测试数据库

当前 `conftest.py` 默认连接：

```text
postgresql+psycopg://postgres@localhost:5432/travel_log_test
```

你需要启动 PostgreSQL，并事先创建 `travel_log_test` 数据库。fixture 中的 `create_all()` 只创建表，不会创建数据库本身。若本机安装了 PostgreSQL 命令行工具且账号配置匹配，可以执行一次：

```bash
createdb -h localhost -U postgres travel_log_test
```

有密码或使用不同账号时，在运行测试的同一个终端设置实际连接信息：

```bash
# 将 your_test_password 替换为测试账号的密码。
export TEST_DATABASE_URL='postgresql+psycopg://postgres:your_test_password@localhost:5432/travel_log_test'
```

**当前 fixture 会在测试开始和结束时调用 `drop_all()`，删除模型对应的表及其数据。`TEST_DATABASE_URL` 必须指向可以清空的专用测试库。** 这是现有代码的实际行为。

`DATABASE_URL` 是应用配置，`TEST_DATABASE_URL` 是测试代码读取的环境变量。测试客户端通过依赖覆盖，让接口使用测试 session。为避免对 `.env` 加载方式产生误解，学习阶段直接使用上面的 `export`。

### 常用命令

```bash
# 运行 tests 下的所有测试
python -m pytest tests -q

# 只运行旅行相关测试
python -m pytest tests/test_trips.py -v

# 只运行一个测试
python -m pytest tests/test_trips.py::test_get_trip -v

# 根据名称筛选测试
python -m pytest tests -k get_trip -v

# 第一次失败就停止，并简化报错堆栈
python -m pytest tests -x --tb=short

# 显示 print 输出
python -m pytest tests/test_trips.py -s

# 查看 fixture 的准备与清理过程
python -m pytest tests/test_trips.py::test_get_trip --setup-show

# 只查看收集到了哪些测试，不执行测试和 fixture
python -m pytest tests --collect-only -q
```

`-q` 简化输出，`-v` 显示更详细的测试名称。`--collect-only` 仍会导入模块，因此不是完全没有导入副作用。命令选择方式可查阅 [pytest 官方运行指南](https://docs.pytest.org/en/stable/how-to/usage.html)。

## 4. fixture：给测试准备东西

fixture 可以准备一条城市记录、一个数据库 session 或一个客户端，也可以负责使用后的清理。

你项目中的例子：

```python
@pytest.fixture()
def city(db):
    city = City(name="上海", country="中国")
    db.add(city)
    db.flush()
    return city
```

这里有三个不同的角色：

| 名字出现的位置 | 代表什么 |
| --- | --- |
| `def city(db)` 中的函数名 `city` | fixture 的名字 |
| 函数内部 `city = City(...)` | 一个 SQLAlchemy 模型实例 |
| 测试参数中的 `city` | pytest 注入的返回值，也就是这个模型实例 |

所以你可以这样使用：

```python
def test_create_trip(client, city):
    # 此时 city 已经是一条准备好的城市记录。
    # 可以读取 city.id。
    ...
```

pytest 根据参数名查找 fixture，先准备依赖，再把返回值传进去。fixture 也可以依赖另一个 fixture。同一个测试里，默认作用域的同名 fixture 会复用已准备好的结果。[fixture 官方说明](https://docs.pytest.org/en/stable/how-to/fixtures.html)

### 你遇到的 `.id` 错误

之前的写法：

```python
@pytest.fixture()
def trip(db):
    trip = Trip(city_id=city.id, title="上海周末游")
    ...
```

由于参数里没有 `city`，函数内部会找到模块级别的 `city` 名字。它是被装饰后的 fixture 定义，不是数据库记录，因此报错：

```text
AttributeError: 'FixtureFunctionDefinition' object has no attribute 'id'
```

现在的正确写法是：

```python
@pytest.fixture()
def trip(db, city):
    trip = Trip(city_id=city.id, title="上海周末游")
    ...
```

这是签名变化的简化示例，完整字段以 `conftest.py` 为准。要使用 fixture 的结果，就在参数中声明依赖；不用导入 `city`，也不用手动调用 `city()`。

## 5. `test_get_trip` 到底怎样运行？

当前测试：

```python
def test_get_trip(client, trip):
    response = client.get(f"/trips/{trip.id}")

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == trip.id
    assert data["title"] == "上海周末游"
    assert data["budget"] == 500
```

它请求的 fixture 依赖关系如下，箭头表示“依赖”：

```text
test_get_trip
├── client ──→ db
└── trip
    ├── db
    └── city ──→ db
```

另外，`prepare_test_database` 是自动启用的 session fixture，会在这些普通 fixture 之前准备表。

运行过程中，pytest 先建立数据库 session，然后满足 `client`、`city` 和 `trip` 的依赖。由于 `trip` 需要 `city`，城市一定会先于旅行创建。同一个测试里的三个 `db` 引用指向同一个 session。

接着，测试发出请求。接口使用同一个测试 session，能查到 fixture 准备的旅行。断言执行完毕后，pytest 清理客户端和数据库资源。没有依赖关系的 fixture 不应靠名字或在文件中的位置来控制执行顺序。

`test_get_trip` 不依赖 `test_create_trip` 先执行：它有自己的 `trip` fixture，因此可以单独运行。

## 6. 读懂 `conftest.py` 的各层

### `prepare_test_database`：整次测试运行的表结构

```python
@pytest.fixture(scope="session", autouse=True)
def prepare_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
```

`scope="session"` 表示一次 pytest 运行共享一次准备过程；这里的 session 指 pytest 运行周期，与 SQLAlchemy 的数据库 `Session` 是两件事。

`autouse=True` 表示适用范围内的测试自动使用它。因此，即使只运行当前的健康检查，也会准备数据库表。甚至在 `tests/` 下添加一个纯计算测试，它也会受这个自动 fixture 影响。

`yield` 前面是准备，后面是清理。此处没有交出数据，只用它分隔两个阶段。此配置依据 SQLAlchemy 模型建表，没有验证 Alembic 迁移是否正确。

### `db`：每个测试的数据库会话

默认 `@pytest.fixture()` 的作用域是 `function`，每个测试单独准备一次。

当前 `db` fixture 为每个测试打开一个连接，开启外层事务，把 session 绑定到该连接，然后 `yield session` 交给测试使用。测试结束后关闭 session、回滚外层事务、关闭连接。

这让每个测试的数据通常不会留给下一个测试。PostgreSQL 的序列编号可能仍然增长，所以不要假设新旅行的 ID 永远是 `1`，应使用 `trip.id` 或响应中的 ID。

路由中的 `db.commit()` 使用的是这个绑定外层事务的 session；在当前配置下，外层事务仍由 fixture 管理。这个机制不覆盖接口自己另开连接的写入、文件上传或外部服务调用，也不代表任意复杂的 rollback 流程都能自动隔离。

### `client`：让接口连接测试数据库

最关键的一行：

```python
app.dependency_overrides[get_db] = override_get_db
```

路由中的 `Depends(get_db)` 原本请求应用数据库 session。测试时 FastAPI 会调用替代函数 `override_get_db`，得到 fixture 的 `db`。这是 FastAPI 的依赖覆盖机制，可参考 [官方测试说明](https://fastapi.tiangolo.com/advanced/testing-dependencies/)。

`TestClient(app)` 可以在 Python 进程内调用应用，不需要提前运行 Uvicorn，也不需要打开浏览器。它仍然会执行路由处理、数据校验和真实的数据库操作。

测试完成后，现有代码调用 `app.dependency_overrides.clear()` 清除覆盖。

### `city`、`trip`、`places`：业务测试数据

| fixture | 返回值 | 依赖 |
| --- | --- | --- |
| `city` | 一条上海城市记录 | `db` |
| `trip` | 一条预算为 500 的上海旅行记录 | `db`、`city` |
| `places` | 武康路、外滩、豫园三条地点记录组成的列表 | `db`、`city` |

`db.add()` 把对象加入 session；`db.flush()` 把待执行的变更发送到数据库，让插入后的对象获得主键，但不提交事务。由于本项目设置了 `autoflush=False`，显式 `flush()` 尤其容易理解和控制。

`places` 是列表，读取第一个地点的 ID 应写 `places[0].id`，不能写 `places.id`。

## 7. 写测试时分成三步

每个测试都可以按“准备 → 操作 → 检查”来组织。fixture 已经承担了部分准备工作。

下面是可以添加到 `tests/test_trips.py` 的新测试：

```python
def test_update_trip_title(client, trip):
    # 准备：trip fixture 已经创建了旅行。
    new_title = "上海美食周末"

    # 操作：请求修改标题。
    response = client.patch(
        f"/trips/{trip.id}",
        json={"title": new_title},
    )

    # 检查：请求成功，返回了正确的数据。
    assert response.status_code == 200, response.text
    assert response.json()["title"] == new_title

    # 再读取一次，检查修改确实可查询到。
    read_response = client.get(f"/trips/{trip.id}")
    assert read_response.status_code == 200, read_response.text
    assert read_response.json()["title"] == new_title
```

`assert 条件, response.text` 会在条件失败时附带响应内容，方便看到服务器返回的错误详情。

不要通过一个测试留下的数据让另一个测试通过。每个测试应能够独立准备所需数据并运行。

## 8. 练习一：补上 Visit 测试

以下示例可复制到当前为空的 `tests/test_visits.py`：

```python
import pytest


def test_create_visit(client, trip, places):
    response = client.post(
        "/visits",
        json={
            "trip_id": trip.id,
            "place_id": places[0].id,
            "day_number": 1,
            "order_index": 1,
            "cost": 35,
            "expense_category": "coffee",
            "rating": 5,
        },
    )

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["trip_id"] == trip.id
    assert data["place_id"] == places[0].id
    assert data["cost"] == 35
    assert data["rating"] == 5
    assert "id" in data


@pytest.mark.parametrize("invalid_rating", [0, 6])
def test_create_visit_rejects_invalid_rating(
    client, trip, places, invalid_rating
):
    response = client.post(
        "/visits",
        json={
            "trip_id": trip.id,
            "place_id": places[0].id,
            "day_number": 1,
            "order_index": 1,
            "rating": invalid_rating,
        },
    )

    assert response.status_code == 422, response.text
    errors = response.json()["detail"]
    assert any(error["loc"] == ["body", "rating"] for error in errors)
```

`app/schemas.py` 中规定评分必须在 1 到 5 之间。第二个函数分别用 0 和 6 运行一次，所以这段代码一共收集出三个测试用例。

这里 `invalid_rating` 由参数化装饰器提供，`client`、`trip`、`places` 由 fixture 提供。检查错误位置可以防止“别的字段出错导致 422”让测试误通过。

## 9. 练习二：补上统计测试

先覆盖“旅行还没有 Visit”这个最容易算出答案的场景。复制到 `tests/test_statistics.py`：

```python
def test_trip_summary_without_visits(client, trip):
    response = client.get(f"/trips/{trip.id}/summary")

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["trip_id"] == trip.id
    assert data["budget"] == 500
    assert data["total_cost"] == 0
    assert data["remaining_budget"] == 500
    assert data["visit_count"] == 0
```

接着练习创建两条 Visit，再检查统计值：

```python
def test_trip_summary_with_visits(client, trip, places):
    for index, cost in enumerate([35, 65], start=1):
        response = client.post(
            "/visits",
            json={
                "trip_id": trip.id,
                "place_id": places[index - 1].id,
                "day_number": 1,
                "order_index": index,
                "cost": cost,
                "expense_category": "food",
            },
        )
        assert response.status_code == 200, response.text

    response = client.get(f"/trips/{trip.id}/summary")

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["total_cost"] == 100
    assert data["remaining_budget"] == 400
    assert data["visit_count"] == 2
```

这里特意采用容易心算的金额：35 + 65 = 100，500 - 100 = 400。后续测试复杂小数运算时，可以用 `pytest.approx(期望值)` 比较浮点结果。

这些是根据当前接口编写的学习示例，生成本文档时没有把它们加入测试文件，也没有实际执行它们。

## 10. 怎样读懂报错？

pytest 执行单个测试时可以分为准备（setup）、测试函数执行（call）、清理（teardown）三个阶段。

| 输出 | 常见含义 | 先检查什么 |
| --- | --- | --- |
| `PASSED` / `.` | 测试通过 | 所有实际执行的断言成立 |
| `FAILED` / `F` | 测试函数执行失败 | 失败的断言或函数内异常 |
| `ERROR` / `E` | 常见于准备、清理或收集阶段异常 | fixture、导入或数据库连接 |
| `SKIPPED` / `s` | 测试被跳过 | 跳过原因 |
| `warning` | 有警告 | 警告的完整内容和来源 |

你之前的 `ERROR ... test_get_trip` 出在准备 `trip` fixture 时，因此测试函数里的 GET 请求和断言还没有执行。

排查顺序可以是：

1. 看报错属于哪个测试，以及是否写着 `ERROR at setup`。
2. 看堆栈最后的异常类型和说明。
3. 找到堆栈中指向你项目文件的那一行。
4. 只运行这个测试，修改后再次验证。

常见问题对应如下：

| 问题 | 本项目中的排查方向 |
| --- | --- |
| `fixture 'xxx' not found` | 参数拼写是否正确，fixture 是否定义在可见的 `conftest.py` 中 |
| fixture 对象没有 `.id` | 是否忘记在参数中声明 `city` 等依赖 |
| PostgreSQL 连接失败 | 服务、端口、账号、密码、测试数据库是否正确 |
| `ModuleNotFoundError: app` | 从 `backend` 目录运行 `python -m pytest`，检查解释器 |
| 预期 200，实际 422 | 查看 `response.text`，核对 `schemas.py` 的必填字段和校验规则 |
| 数据唯一性冲突 | 是否重复插入同名城市，或测试事务是否正确清理 |

仅凭 `1 warning` 不能判断警告原因，需要阅读完整警告内容。

## 11. 建议的学习顺序

1. 单独运行 `test_liveness`，读懂请求和两个断言。
2. 运行 `test_get_trip --setup-show`，对照依赖关系理解 fixture。
3. 临时把旅行标题的期望值改错，观察失败报告，然后改回来。
4. 添加修改标题的测试，练习准备、操作、检查。
5. 添加 Visit 示例，理解参数化如何生成多个用例。
6. 添加 summary 示例，再自己补一个费用为 0 的场景。
7. 自己写“删除旅行后再次 GET 返回 404”的测试。

学完后，尝试回答这些问题：

- 为什么 `test_get_trip` 可以单独运行？
- 为什么 `trip` 和 `places` 创建出的记录属于同一个城市？
- 为什么 `db.flush()` 后可以读取新记录的 ID？
- 为什么测试时不用启动 Uvicorn，却仍然需要 PostgreSQL？
- 为什么一个 fixture 出错时，测试函数可能完全没有执行？

答案分别是：它自己请求 `trip` fixture；同一个测试复用了 `city`；flush 执行了插入并取得主键；TestClient 在进程内调用应用而数据库连接仍是真实的；准备阶段必须成功后才会执行测试函数。
