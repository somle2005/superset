# odps.py
from superset.db_engine_specs.base import BaseEngineSpec
from typing import Any

class OdpsEngineSpec(BaseEngineSpec):
    """Custom Engine Spec for ODPS (MaxCompute)"""
    engine = "odps"  # 必须与 SQLAlchemy URI dialect 名称匹配，比如 odps://

    @classmethod
    def apply_limit_to_sql(cls, sql: str, limit: int, **kwargs: Any) -> str:
        """
        在执行SQL前加上: set odps.sql.allow.fullscan=true;
        然后再使用父类逻辑应用 limit（如果需要）
        """
        
        # 在SQL最前面插入全量扫描的允许设置
        sql_with_fullscan = "set odps.sql.allow.fullscan=true;" + sql.replace('\n', '')
        
        # 调用父类的逻辑来应用 limit
        return super().apply_limit_to_sql(sql_with_fullscan, limit, **kwargs)
